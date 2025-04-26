import { BASE_MSBANK_URL, BASE_MSUSER_URL, SIGN_IN_ROUTE } from "../utils/const";
import React, { useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function TransactionHist() {
  const [data, setData] = React.useState(null);
  const { id } = useParams();
  const access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");
  if (!access) {
    window.location.href = SIGN_IN_ROUTE;
  }

  useEffect(() => {
    axios.get(`/v1/accounts/${id}/history`, {
      baseURL: BASE_MSBANK_URL,
      headers: { Authorization: `Bearer ${access}`, "Access-Control-Allow-Origin": "*" },
    }).then((response) => {
      setData(response.data);
    }).catch((error) => {
      axios.post("/v1/auth/refresh", { "refreshToken": refresh }, {
        baseURL: BASE_MSUSER_URL,
        headers: { Authorization: `Bearer ${refresh}`, "Access-Control-Allow-Origin": "*" },
      }).then(({ data }) => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.setItem("accessToken", data?.tokens?.accessToken);
        localStorage.setItem("refreshToken", data?.tokens?.refreshToken);
        axios.get(`/v1/accounts/${id}/history`, {
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
  }, [access, refresh, id]);

  return <div>
    {data?.items?.length ? data?.items.map((item) => <Transaction transaction={item} access={access}
                                                                  refresh={refresh}></Transaction>) :
      <p>История транзакций отсутствует</p>}
  </div>;
}

function Transaction({ transaction, access, refresh }) {
  return <div>
    <p>Номер счёта отправителя {transaction.senderId}</p>
    <p>Номер счёта получателя {transaction.receiverId}</p>
    <p>Статус транзакции: {transaction.status}</p>
    <p>Количество средств: {transaction.amountCents}</p>
    <p>Дата создания: {transaction.createdAt}</p>
    <p>Описание: {transaction.description}</p>
    {transaction.status?.trim().toUpperCase() === "BLOCKED" ? <button onClick={() => {
      axios.patch(`/v1/transactions/${transaction.id}?status=CANCELLED`, {}, {
        baseURL: BASE_MSBANK_URL,
        headers: { Authorization: `Bearer ${access}`, "Access-Control-Allow-Origin": "*" },
      }).then((response) => {
        window.location.reload()
      }).catch((error) => {
        axios.post("/v1/auth/refresh", { "refreshToken": refresh }, {
          baseURL: BASE_MSUSER_URL,
          headers: { Authorization: `Bearer ${refresh}`, "Access-Control-Allow-Origin": "*" },
        }).then(({ data }) => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.setItem("accessToken", data?.tokens?.accessToken);
          localStorage.setItem("refreshToken", data?.tokens?.refreshToken);
          axios.patch(`/v1/transactions/${transaction.id}?status=CANCELLED`, {}, {
            baseURL: BASE_MSBANK_URL,
            headers: { Authorization: `Bearer ${data?.tokens?.accessToken}`, "Access-Control-Allow-Origin": "*" },
          }).then((response) => {
            window.location.reload()
          });
        }).catch((error) => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = SIGN_IN_ROUTE;
        });
      });
    }}>Отменить транзакцию</button> : <p></p>}
    <hr/>
  </div>;
}

export default TransactionHist;
