import React, { useEffect } from "react";
import { BASE_MSUSER_URL, SIGN_IN_ROUTE } from "../utils/const";
import axios from "axios";

function Hist() {
  const [data, setData] = React.useState(null);
  const access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");
  if (!access) {
    window.location.href = SIGN_IN_ROUTE;
  }

  useEffect(() => {
    axios.get(`/v1/me/auth-history`, {
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
        axios.get(`/v1/me/auth-history`, {
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

  return <div id="auth-hist">
    {data?.items?.length ? data?.items.map((item) => <HistEntity histEntity={item}></HistEntity>) :
      <p>История входов отсутствует</p>}
  </div>
}

function HistEntity({histEntity}) {
 return <div className="histEntity">
   <p>Агент: {histEntity.agent}</p>
   <p>IP: {histEntity.ip}</p>
   <p>Время входа: {histEntity.timestamp}</p>
   <hr/>
 </div>
}

export default Hist;
