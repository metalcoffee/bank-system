package postgres

import (
	"x-bank-users/cerrors"
	"x-bank-users/ercodes"
)

func (s *Service) Close() {
	_ = s.db.Close()
}

func (s *Service) wrapQueryError(err error) error {
	return cerrors.NewErrorWithUserMessage(ercodes.PostgresQuery, err, "Ошибка работы с базой данных")
}

func (s *Service) wrapScanError(err error) error {
	return cerrors.NewErrorWithUserMessage(ercodes.PostgresScan, err, "Ошибка работы с базой данных")
}
