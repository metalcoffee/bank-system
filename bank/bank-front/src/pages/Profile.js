import Joi from "joi";
import { ACCOUNTS_ROUTE, BASE_MSUSER_URL, SIGN_IN_ROUTE, WORKPLACES_ROUTE } from "../utils/const";
import React, { useEffect } from "react";
import axios from "axios";
import { joiValidate } from "../utils/joiValidate";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const schema = Joi.object({
  lastName: Joi.string().min(2).max(32).regex(RegExp("^[А-Яа-я]+$"), "i"),
  firstName: Joi.string().min(2).max(32).regex(RegExp("^[А-Яа-я]+$"), "i"),
  fathersName: Joi.string().min(0).max(32).regex(RegExp("^[А-Яа-я]*$"), "i"),
  gender: Joi.string().min(1),
  phoneNumber: Joi.string().regex(RegExp("^\\+[0-9]+")),
  passportId: Joi.string().alphanum().min(5),
  dateOfBirth: Joi.date().greater(new Date(1900, 1, 1)),
  address: Joi.string().min(10),
  liveInCountry: Joi.number().min(1),
});

function Profile() {
  const [data, setData] = React.useState(null);
  const access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");
  if (!access) {
    window.location.href = SIGN_IN_ROUTE;
  }

  const [countries, setCountries] = React.useState(null);

  useEffect(() => {
    axios.get("/v1/countries", {
      baseURL: BASE_MSUSER_URL,
      headers: { Authorization: `Bearer ${access}`, "Access-Control-Allow-Origin": "*" },
    }).then((response) => {
      setCountries(response.data);
    }).catch((error) => {
      axios.post("/v1/auth/refresh", { "refreshToken": refresh }, {
        baseURL: BASE_MSUSER_URL,
        headers: { Authorization: `Bearer ${refresh}`, "Access-Control-Allow-Origin": "*" },
      }).then(({ data }) => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.setItem("accessToken", data?.tokens?.accessToken);
        localStorage.setItem("refreshToken", data?.tokens?.refreshToken);
        axios.get("/v1/countries", {
          baseURL: BASE_MSUSER_URL,
          headers: { Authorization: `Bearer ${data?.tokens?.accessToken}`, "Access-Control-Allow-Origin": "*" },
        }).then((response) => {
          setCountries(response.data?.personaldata);
        });
      }).catch((error) => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = SIGN_IN_ROUTE;
      });
    });
  }, [access, refresh]);

  useEffect(() => {
    axios.get("/v1/me/personal-data", {
      baseURL: BASE_MSUSER_URL,
      headers: { Authorization: `Bearer ${access}`, "Access-Control-Allow-Origin": "*" },
    }).then((response) => {
      setData(response.data?.personalData);
    }).catch((error) => {
      axios.post("/v1/auth/refresh", { "refreshToken": refresh }, {
        baseURL: BASE_MSUSER_URL,
        headers: { Authorization: `Bearer ${refresh}`, "Access-Control-Allow-Origin": "*" },
      }).then(({ data }) => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.setItem("accessToken", data?.tokens?.accessToken);
        localStorage.setItem("refreshToken", data?.tokens?.refreshToken);
        axios.get("/v1/me/personal-data", {
          baseURL: BASE_MSUSER_URL,
          headers: { Authorization: `Bearer ${data?.tokens?.accessToken}`, "Access-Control-Allow-Origin": "*" },
        }).then((response) => {
          setData(response.data?.personaldata);
        });
      }).catch((error) => {
        // localStorage.removeItem("accessToken");
        // localStorage.removeItem("refreshToken");
        // window.location.href = SIGN_IN_ROUTE;
      });
    });
  }, [access, refresh]);
  if (data) {

    var gender = document.getElementById("gender");
    for (var i, j = 0; i = gender.options[j]; j++) {
      if (i.value === data?.gender) {
        gender.selectedIndex = j;
        break;
      }
    }

    var liveInCountry = document.getElementById("liveInCountry");
    for (var i, j = 0; i = liveInCountry.options[j]; j++) {
      if (i.text === data?.liveInCountry) {
        liveInCountry.selectedIndex = j;
        break;
      }
    }

    document.getElementById("lastName").value = data?.lastName;
    document.getElementById("firstName").value = data?.firstName;
    document.getElementById("fathersName").value = data?.fathersName;
    document.getElementById("phoneNumber").value = data?.phoneNumber;
    document.getElementById("passportId").value = data?.passportId;
    document.getElementById("dateOfBirth").value = data?.dateOfBirth;
    document.getElementById("address").value = data?.address;
  }
  return (<div id="profile">
    <form id="personal-data" onSubmit={async (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.target).entries());


      const isValid = joiValidate(schema, new FormData(e.target));
      if (!isValid) {
        return;
      }

      if (formData.dateOfBirth === null) {
        toast.error("Неверная дата рождения");
        return;
      }

      const dataToPost = { ...formData, liveInCountry: +formData.liveInCountry };

      axios.put("/v1/me/personal-data", dataToPost, {
        baseURL: BASE_MSUSER_URL,
        headers: { Authorization: `Bearer ${access}`, "Access-Control-Allow-Origin": "*" },
      }).then((response) => {
        window.location.href = ACCOUNTS_ROUTE;
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
          axios.put("/v1/me/personal-data", dataToPost, {
            baseURL: BASE_MSUSER_URL,
            headers: { Authorization: `Bearer ${data?.tokens?.accessToken}`, "Access-Control-Allow-Origin": "*" },
          }).then((response) => {
            window.location.href = ACCOUNTS_ROUTE;
          });
        }).catch((error) => {
          toast(error);
        });
      });
    }}>
      <h3 className="description">Персональные данные</h3>
      <label htmlFor="gender">Пол:</label>
      <select id="gender" name="gender">
        <option value=""></option>
        <option value="M">Мужской</option>
        <option value="F">Женский</option>
      </select>
      <br/>

      <label htmlFor="lastName">Фамилия:</label>
      <input type="text" id="lastName" name="lastName"/>
      <br/>

      <label htmlFor="firstName">Имя:</label>
      <input type="text" id="firstName" name="firstName"/>
      <br/>

      <label htmlFor="fathersName">Отчество:</label>
      <input type="text" id="fathersName" name="fathersName"/>
      <br/>

      <label htmlFor="phoneNumber">Номер телефона:</label>
      <input type="tel" id="phoneNumber" name="phoneNumber"/>
      <br/>

      <label htmlFor="passportId">Идентификационный номер паспорта:</label>
      <input type="tel" id="passportId" name="passportId"/>
      <br/>

      <label htmlFor="dateOfBirth">Дата рождения:</label>
      <input type="date" id="dateOfBirth" name="dateOfBirth"/>
      <br/>

      <label htmlFor="liveInCountry">Страна проживания:</label>
      <select id="liveInCountry" name="liveInCountry">
        <option value=""></option>
        {countries?.length ? countries.map((item) => <option value={item.id}
                                                             selected={item.name === data?.liveInCountry}>{item.name}</option>) :
          <p></p>}
        {/*<option value="1">Республика Беларусь</option>*/}
        {/*<option value="2">Россия</option>*/}
      </select>
      <br/>

      <label htmlFor="address">Адрес проживания:</label>
      <input type="text" id="address" name="address"/>
      <br/>
      <button>Сохранить данные</button>
    </form>
    <Link to={WORKPLACES_ROUTE}>Работа</Link>
  </div>);
}

export default Profile;
