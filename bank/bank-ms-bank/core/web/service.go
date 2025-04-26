package web

import (
	"context"
	"x-bank-ms-bank/cerrors"
	"x-bank-ms-bank/entity"
	"x-bank-ms-bank/ercodes"
)

type (
	Service struct {
		accountStorage     AccountStorage
		passwordHasher     PasswordHasher
		atmStorage         AtmStorage
		transactionStorage TransactionStorage
	}
)

func NewService(accountStorage AccountStorage, passwordHasher PasswordHasher, atmStorage AtmStorage, transactionStorage TransactionStorage) Service {
	return Service{
		accountStorage:     accountStorage,
		passwordHasher:     passwordHasher,
		atmStorage:         atmStorage,
		transactionStorage: transactionStorage,
	}
}

const (
	statusCancelled = "CANCELLED"
)

func (s *Service) GetAccounts(ctx context.Context, userId int64) ([]entity.UserAccountData, error) {
	return s.accountStorage.GetUserAccounts(ctx, userId)
}

func (s *Service) OpenAccount(ctx context.Context, userId int64) error {
	return s.accountStorage.OpenUserAccount(ctx, userId)
}

func (s *Service) BlockAccount(ctx context.Context, accountId, userId int64) error {
	accountInfo, err := s.accountStorage.GetAccountDataById(ctx, accountId)
	if err != nil {
		return err
	}
	if accountInfo.UserId != userId {
		return cerrors.NewErrorWithUserMessage(ercodes.AccessDenied, nil, "Ошибка доступа")
	}
	return s.accountStorage.BlockUserAccount(ctx, accountId)
}

func (s *Service) GetAccountHistory(ctx context.Context, accountId, userId, limit, offset int64) ([]entity.AccountTransactionsData, int64, error) {
	accountInfo, err := s.accountStorage.GetAccountDataById(ctx, accountId)
	if err != nil {
		return []entity.AccountTransactionsData{}, 0, err
	}
	if accountInfo.UserId != userId {
		return []entity.AccountTransactionsData{}, 0, cerrors.NewErrorWithUserMessage(ercodes.AccessDenied, nil, "Ошибка доступа")
	}

	return s.accountStorage.GetAccountHistory(ctx, accountId, limit, offset)
}

func (s *Service) MakeTransaction(ctx context.Context, senderId, receiverId, amountCents, userId int64, description string) (int64, error) {
	senderAccountData, err := s.accountStorage.GetAccountDataById(ctx, senderId)
	if err != nil {
		return 0, err
	}

	if senderAccountData.Status == "BLOCKED" {
		return 0, cerrors.NewErrorWithUserMessage(ercodes.BlockedAccount, nil, "Счёт отправителя заблокирован")
	}
	if senderAccountData.BalanceCents < amountCents {
		return 0, cerrors.NewErrorWithUserMessage(ercodes.NotEnoughMoney, nil, "Недостаточно средств")
	}
	if userId != 0 && senderAccountData.UserId != userId {
		return 0, cerrors.NewErrorWithUserMessage(ercodes.AccessDenied, nil, "Ошибка доступа")
	}

	receiverAccountData, err := s.accountStorage.GetAccountDataById(ctx, receiverId)
	if err != nil {
		return 0, err
	}

	if receiverAccountData.Status == "BLOCKED" {
		return 0, cerrors.NewErrorWithUserMessage(ercodes.BlockedAccount, nil, "Счёт получателя заблокирован")
	}

	id, err := s.transactionStorage.CreateTransaction(ctx, senderId, receiverId, amountCents, description)
	return id, err
}

func (s *Service) ATMSupplement(ctx context.Context, login, password string, amountCents int64) error {
	_, err := s.changeATMState(ctx, login, password, amountCents, 0)
	return err
}

func (s *Service) ATMWithdrawal(ctx context.Context, login, password string, amountCents int64) error {
	_, err := s.changeATMState(ctx, login, password, -amountCents, 0)
	return err
}

func (s *Service) ATMUserSupplement(ctx context.Context, login, password string, amountCents, accountId, userId int64) error {
	atmAccountId, err := s.changeATMState(ctx, login, password, amountCents, accountId)
	if err != nil {
		return err
	}
	id, err := s.MakeTransaction(ctx, atmAccountId, accountId, amountCents, userId, "Пополнение счёта")
	if err != nil {
		return err
	}
	return s.transactionStorage.ConfirmTransactionById(ctx, id)
}

func (s *Service) ATMUserWithdrawal(ctx context.Context, login, password string, amountCents, accountId, userId int64) error {
	atmAccountId, err := s.changeATMState(ctx, login, password, -amountCents, accountId)
	if err != nil {
		return err
	}
	id, err := s.MakeTransaction(ctx, atmAccountId, accountId, -amountCents, userId, "Снятие денег со счёта")
	if err != nil {
		return err
	}
	return s.transactionStorage.ConfirmTransactionById(ctx, id)
}

func (s *Service) changeATMState(ctx context.Context, login, password string, amountCents, userAccountId int64) (int64, error) {
	atmData, err := s.atmStorage.GetAtmDataByLogin(ctx, login)
	if err != nil {
		return 0, err
	}

	if err = s.passwordHasher.CompareHashAndPassword(ctx, password, atmData.PasswordHash); err != nil {
		return 0, err
	}

	if err = s.atmStorage.UpdateAtmCash(ctx, amountCents, atmData.Id); err != nil {
		return 0, err
	}
	if err = s.accountStorage.UpdateAtmAccount(ctx, amountCents, atmData.AccountId); err != nil {
		return 0, err
	}
	if err = s.atmStorage.LogCashOperation(ctx, atmData.Id, amountCents, userAccountId); err != nil {
		return 0, err
	}
	return atmData.AccountId, nil
}

func (s *Service) ChangeStatus(ctx context.Context, transactionId int64, status string) error {
	if status != statusCancelled {
		return cerrors.NewErrorWithUserMessage(ercodes.InvalidStatus, nil, "Неверный статус транзакции")
	}
	return s.transactionStorage.ChangeStatusById(ctx, transactionId, status)
}
