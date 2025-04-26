import React, { useEffect } from "react";
import { ACCOUNTS_ROUTE, BASE_MSUSER_URL, SIGN_IN_ROUTE } from "../utils/const";
import axios from "axios";
import { toast } from "react-toastify";

function Workplaces() {
  const [data, setData] = React.useState(null);
  const access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");
  if (!access) {
    window.location.href = SIGN_IN_ROUTE;
  }

  useEffect(() => {
    axios.get(`/v1/me/work`, {
      baseURL: BASE_MSUSER_URL,
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
        axios.get(`/v1/me/work`, {
          baseURL: BASE_MSUSER_URL,
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
  return <div id={"workplaces"}>
    <form onSubmit={async (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.target).entries());
      if (data && (!formData.hasOwnProperty("endDate") || formData.endDate === "")) {
        toast.error("Перед добавлением необходимо заполнить дату окончания прошлой работы")
        return;
      }
      const dataToPost = { ...formData };

      axios.post("/v1/me/work", dataToPost, {
        baseURL: BASE_MSUSER_URL,
        headers: { Authorization: `Bearer ${access}`, "Access-Control-Allow-Origin": "*" },
      }).then((response) => {
        window.location.reload()
      }).catch((error) => {
        if (error.response.status === 400) {
          toast.error(error.response?.data?.userMessage);
          return;
        }
        axios.post("/v1/auth/refresh", { "refreshToken": refresh }, {
          baseURL: BASE_MSUSER_URL,
          headers: { Authorization: `Bearer ${refresh}`, "Access-Control-Allow-Origin": "*" },
        }).then(({ data }) => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.setItem("accessToken", data?.tokens?.accessToken);
          localStorage.setItem("refreshToken", data?.tokens?.refreshToken);
          axios.post("/v1/me/work", dataToPost, {
            baseURL: BASE_MSUSER_URL,
            headers: { Authorization: `Bearer ${data?.tokens?.accessToken}`, "Access-Control-Allow-Origin": "*" },
          }).then((response) => {
            window.location.reload()
          }).catch((error) => {
            toast(error)
          });
        }).catch((error) => {
          toast(error);
        });
      });
    }}>
      {data ? <p>
        <label htmlFor="endDate">Дата окончания работы на прошлом месте:</label>
        <input type="date" name="endDate" id="endDate"/>
      </p> : <p></p>}
      <p>
        <label htmlFor="companyName">Название компании:</label>
        <input type="string" name="companyName" id="companyName"/>
      </p>
      <p>
        <label htmlFor="companyAddress">Адрес компании:</label>
        <input type="string" name="companyAddress" id="companyAddress"/>
      </p>
      <p>
        <label htmlFor="position">Должность:</label>
        <input type="string" name="position" id="position"/>
      </p>
      <p>
        <label htmlFor="startDate">Дата начала работы:</label>
        <input type="date" name="startDate" id="startDate"/>
      </p>
      <button>Добавить новое место работы</button>
    </form>
    <hr/>
    <div id="places">
      {data?.length ? data?.map((item) => <Workplace workplace={item}></Workplace>) : <p>Работа не указана</p>}
    </div>
  </div>
}

function Workplace({ workplace}) {
  return <div>
    <p>Название компании: {workplace.companyName}</p>
    <p>Адрес компании: {workplace.companyAddress}</p>
    <p>Должность: {workplace.position}</p>
    <p>Дата начала: {new Date(workplace.startDate * 1000).toDateString() }</p>
    {workplace.endDate ? <p>Дата окончания: {new Date(workplace.endDate * 1000).toDateString() }</p> : <p></p>}
  </div>
}

export default Workplaces;
