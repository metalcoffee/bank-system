import React from "react";
import axios from "axios";
import { BASE_MSBANK_URL } from "../utils/const";
import { toast } from "react-toastify";

function Atm() {
  var atmPassword = localStorage.getItem("atmPassword");
  var atmLogin = localStorage.getItem("atmLogin");
  const [balance, setBalance] = React.useState(null);


  if (atmPassword && atmLogin) {
    axios.get("/v1/atm", {
      baseURL: BASE_MSBANK_URL,
      headers: { Authorization: `Basic ${btoa(atmLogin + ":" + atmPassword)}`, "Access-Control-Allow-Origin": "*" },
    }).then((response) => {
      setBalance(response.data?.balance)
      document.getElementById("balance").innerHTML = `Баланс: ${balance}`;
    } ).catch((err) => {});
  }

  return <div>
    <p>
      <label htmlFor="id_username">Логин:</label>
      <input type="text" name="name" maxLength="150" id="id_username"/>
    </p>
    <p>
      <label htmlFor="id_password">Пароль:</label>
      <input type="password" name="password" required id="id_password"/>
    </p>
    <button type="submit" onClick={() => {
      var login = document.getElementById("id_username").value;
      var password = document.getElementById("id_password").value;
      localStorage.setItem("atmLogin", login);
      localStorage.setItem("atmPassword", password);
      window.location.reload();
    }}>
      Сохранить данные для входа
    </button>
    <p id="balance"></p>
    <hr/>


    <p>ATM пополнение</p>
    <p>
      <label htmlFor="idATMSAmount">Количсетво:</label>
      <input type="number" name="ATMSAmount" id="idATMSAmount"/>
    </p>
    <button onClick={() => {
      var atmAm = document.getElementById("idATMSAmount").value;
      if (atmAm == null || atmAm <= 0) {
        toast.error("Неверное количество");
      }
      console.log(atmAm);
      axios.post("/v1/atm/supplement", { "amountCents": +atmAm }, {
        baseURL: BASE_MSBANK_URL,
        headers: { Authorization: `Basic ${btoa(atmLogin + ":" + atmPassword)}`, "Access-Control-Allow-Origin": "*" },
      }).then(() => {
        window.location.reload();
      }).catch((err) => {
        if (err.response?.data?.internalCode === "-6") {
          toast.error("Неверные логин и пароль");
          return;
        }
        toast.error(err.response?.data?.userMessage);
      });
    }}>Добавить
    </button>
    <hr/>

    <p>ATM снятие</p>
    <p>
      <label htmlFor="idATMWAmount">Количество:</label>
      <input type="number" name="ATMWAmount" id="idATMWAmount"/>
    </p>
    <button onClick={() => {
      var atmAm = document.getElementById("idATMWAmount").value;
      if (atmAm == null || atmAm <= 0) {
        toast.error("Неверное количество");
      }
      console.log(atmAm);
      axios.post("/v1/atm/withdrawal", { "amountCents": +atmAm }, {
        baseURL: BASE_MSBANK_URL,
        headers: { Authorization: `Basic ${btoa(atmLogin + ":" + atmPassword)}`, "Access-Control-Allow-Origin": "*" },
      }).then(() => {
        window.location.reload();
      }).catch((err) => {
        if (err.response?.data?.internalCode === "-6") {
          toast.error("Неверные логин и пароль");
          return;
        }
        toast.error(err.response?.data?.userMessage);
      });
    }}>Снять
    </button>
    <hr/>

    <p>Пополнение счёта пользователя</p>
    <p>
      <label htmlFor="idUserSAmount">Количество средств:</label>
      <input type="number" name="UserSAmount" id="idUserSAmount"/>
    </p>
    <p>
      <label htmlFor="idUserId">Id счёта пользователя:</label>
      <input type="number" name="userId" id="idUserId"/>
    </p>
    <button onClick={() => {
      var atmAm = document.getElementById("idUserSAmount").value;
      if (atmAm == null || atmAm <= 0) {
        toast.error("Неверное количество");
      }
      var userAccId = document.getElementById("idUserId").value;
      if (userAccId == null || userAccId <= 0) {
        toast.error("Неверное количество");
      }
      axios.post("/v1/atm/user/supplement", { "amountCents": +atmAm, accountId: +userAccId }, {
        baseURL: BASE_MSBANK_URL,
        headers: { Authorization: `Basic ${btoa(atmLogin + ":" + atmPassword)}`, "Access-Control-Allow-Origin": "*" },
      }).then(() => {
        window.location.reload();
      }).catch((err) => {
        if (err.response?.data?.internalCode === "-6") {
          toast.error("Неверные логин и пароль");
          return;
        }
        toast.error(err.response?.data?.userMessage);
      });
    }}>Добавить
    </button>
    <hr/>

    <p>Снятие средств со ссчёта пользователя</p>
    <p>
      <label htmlFor="idUserWAmount">Количество средств:</label>
      <input type="number" name="UserWAmount" id="idUserWAmount"/>
    </p>
    <p>
      <label htmlFor="idUserWId">Id счёта пользователя:</label>
      <input type="number" name="userWId" id="idUserWId"/>
    </p>
    <button onClick={() => {
      var atmAm = document.getElementById("idUserWAmount").value;
      if (atmAm == null || atmAm <= 0) {
        toast.error("Неверное количество");
      }
      var userAccId = document.getElementById("idUserWId").value;
      if (userAccId == null || userAccId <= 0) {
        toast.error("Неверное количество");
      }
      axios.post("/v1/atm/user/withdrawal", { "amountCents": +atmAm, accountId: +userAccId }, {
        baseURL: BASE_MSBANK_URL,
        headers: { Authorization: `Basic ${btoa(atmLogin + ":" + atmPassword)}`, "Access-Control-Allow-Origin": "*" },
      }).then(() => {
        window.location.reload();
      }).catch((err) => {
        if (err.response?.data?.internalCode === "-6") {
          toast.error("Неверные логин и пароль");
          return;
        }
        toast.error(err.response?.data?.userMessage);
      });
    }}>Снять
    </button>
    <hr/>
  </div>;
}

export default Atm;
