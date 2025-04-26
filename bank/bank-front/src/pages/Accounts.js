import React, { useEffect } from "react";
import axios from "axios";
import {
  BASE_MSBANK_URL,
  BASE_MSUSER_URL, HIST_ROUTE,
  PROFILE_ROUTE,
  SIGN_IN_ROUTE,
  TRANSACTIONS_HIST_ROUTE,
} from "../utils/const";
import Joi from "joi";
import { joiValidate } from "../utils/joiValidate";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function Accounts() {
  const [data, setData] = React.useState(null);
  const access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");
  if (!access) {
    window.location.href = SIGN_IN_ROUTE;
  }
  useEffect(() => {
    axios.get("/v1/me/accounts", {
      baseURL: BASE_MSBANK_URL,
      headers: { Authorization: `Bearer ${access}`, "Access-Control-Allow-Origin": "*" },
    }).then((response) => {
      setData(response.data);
    }).catch((error) => {
      axios.post("/v1/auth/refresh", { "refreshToken": refresh }, {
        baseURL: BASE_MSUSER_URL,
        headers: { Authorization: `Bearer ${refresh}`, "Access-Control-Allow-Origin": "*" },
      }).then(({data}) => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.setItem("accessToken", data?.tokens?.accessToken);
        localStorage.setItem("refreshToken", data?.tokens?.refreshToken);
        axios.get("/v1/me/accounts", {
          baseURL: BASE_MSBANK_URL,
          headers: { Authorization: `Bearer ${data?.tokens?.accessToken}`, "Access-Control-Allow-Origin": "*" },
        }).then((response) => {
          setData(response.data);
        });
      }).catch((error) => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = SIGN_IN_ROUTE;
      });
    });
  }, [access, refresh]);

  return (
    <div>
      <div className="navigate">
        <Link to={PROFILE_ROUTE}>Профиль</Link>
        <Link to={HIST_ROUTE}>История входов в аккаунт</Link>
        <button onClick={() => {
          localStorage.clear()
          window.location.href = SIGN_IN_ROUTE;
        }}>Выход</button>
      </div>
      <div className="accounts">
        {data?.accounts?.length ? data.accounts.map((account) => <Account account={account}></Account>) :
          <p>У Вас нет открытых счетов</p>}
      </div>
      <button onClick={() => {
        axios.get("/v1/me", {
          baseURL: BASE_MSUSER_URL,
          headers: { Authorization: `Bearer ${access}`, "Access-Control-Allow-Origin": "*" },
        }).then((response) => {
          if (!response.data?.personalData) {
            toast.error("Необходимо заполнитб информацию в профиле для создания счёта")
          }
        })

        axios.post("/v1/accounts", {}, {
          baseURL: BASE_MSBANK_URL,
          headers: { Authorization: `Bearer ${access}`, "Access-Control-Allow-Origin": "*" },
        }).then(() => window.location.reload()).catch((error) => {
          axios.post("/v1/auth/refresh", { "refreshToken": refresh }, {
            baseURL: BASE_MSUSER_URL,
            headers: { Authorization: `Bearer ${refresh}`, "Access-Control-Allow-Origin": "*" },
          }).then(({ data }) => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.setItem("accessToken", data?.tokens?.accessToken);
            localStorage.setItem("refreshToken", data?.tokens?.refreshToken);
            axios.post(`/v1/accounts`, {}, {
              baseURL: BASE_MSBANK_URL,
              headers: { Authorization: `Bearer ${data?.tokens?.accessToken}`, "Access-Control-Allow-Origin": "*" },
            }).then((response) => {});
          }).catch((error) => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = SIGN_IN_ROUTE;
          });
        });
      }}>Добавить новый счёт
      </button>
    </div>
  );
}

const schema = Joi.object({
  accountId: Joi.number().min(1),
  amount: Joi.number().min(1)
});

function Account({ account }) {
  const access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");
  return <div className="account">
    <p>Номер счёта: {account.id}</p>
    <p>Баланс: {account.balanceCents}</p>
    <p>Статус: {account.status}</p>

    <form onSubmit={async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      const secondAccountId = formData.get("accountId");
      const amount = formData.get("amount");
      const isValid = joiValidate(schema, formData);
      if (!isValid) {
        return;
      }
      try {
        axios.post("/v1/transactions", {
          senderId: +account.id,
          receiverId: +secondAccountId,
          amountCents: +amount,
          description: "Перевод",
        }, {
          baseURL: BASE_MSBANK_URL,
          headers: { Authorization: `Bearer ${access}`, "Access-Control-Allow-Origin": "*" },
        }).then(() => {
          window.location.reload();
        }).catch((error) => {
          if (error.response.status === 400) {
            toast.error(error.response?.data?.userMessage);
            return;
          }
          axios.post("/v1/auth/refresh", { "refreshToken": refresh }, {
            baseURL: BASE_MSUSER_URL,
            headers: { "Access-Control-Allow-Origin": "*" },
          }).then(({ data }) => {
            console.log(data);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.setItem("accessToken", data?.tokens?.accessToken);
            localStorage.setItem("refreshToken", data?.tokens?.refreshToken);
            axios.post("/v1/transactions", {
              senderId: +account.id,
              receiverId: +secondAccountId,
              amountCents: +amount,
              description: "Перевод",
            }, {
              baseURL: BASE_MSBANK_URL,
              headers: { Authorization: `Bearer ${data?.tokens?.accessToken}`, "Access-Control-Allow-Origin": "*" },
            }).then(() => {
              window.location.reload();
            });
          }).catch((error) => {
            if (error.response.status === 400) {
              toast.error(error.response?.data?.userMessage);
              return;
            }
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = SIGN_IN_ROUTE;
          });
        });
      } catch (err) {
        console.log(err);
        toast(err.response?.data?.userMessage);
      }

    }}>
      <label htmlFor="id_accountId">Номер счёта для перевода: </label>
      <input type="number" name="accountId" id="account_id"/>
      <label htmlFor="id_amount">Количество средств для перевода: </label>
      <input type="number" name="amount" id="id_amount"/>
      <button>Перевести на счёт</button>
    </form>
    <button onClick={() => {
      axios.patch(`/v1/accounts/${account.id}`, {}, {
        baseURL: BASE_MSBANK_URL,
        headers: { Authorization: `Bearer ${access}`, "Access-Control-Allow-Origin": "*" },
      }).then(() => {
        window.location.reload();
      }).catch((error) => {
        axios.post("/v1/auth/refresh", { "refreshToken": refresh }, {
          baseURL: BASE_MSUSER_URL,
          headers: { "Access-Control-Allow-Origin": "*" },
        }).then(({ data }) => {
          console.log(data);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.setItem("accessToken", data?.tokens?.accessToken);
          localStorage.setItem("refreshToken", data?.tokens?.refreshToken);
          axios.patch(`/v1/accounts/${account.id}`, {}, {
            baseURL: BASE_MSBANK_URL,
            headers: { Authorization: `Bearer ${data?.tokens?.accessToken}`, "Access-Control-Allow-Origin": "*" },
          }).then((response) => {
            window.location.reload();
          });
        }).catch((error) => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = SIGN_IN_ROUTE;
        });
      });
    }}>Заблокировать счёт
    </button>
    <br/>
    <Link to={`${TRANSACTIONS_HIST_ROUTE}/${account.id}`} className="transaction-history-link">Просмотреть историю транзакций</Link>
    <hr/>
  </div>;
}

export default Accounts;
