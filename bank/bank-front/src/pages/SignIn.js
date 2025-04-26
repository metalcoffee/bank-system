import React from "react";
import { Link } from "react-router-dom";
import { ACCOUNTS_ROUTE, BASE_MSUSER_URL, SIGN_UP_ROUTE } from "../utils/const";
import { toast } from "react-toastify";
import axios from "axios";

function SignIn(props) {
  return (
    <div className="sign-in">
      <h2>Welcome</h2>
      <form onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
          const response = await fetch("https://api.ipify.org?format=json");
          const ipdata = await response.json();
          const { data } = await axios.post("/v1/auth/sign-in", {
            login: formData.get("name"),
            password: formData.get("password"),
          }, { baseURL: BASE_MSUSER_URL, headers: { "X-Real-Ip": ipdata.ip } });
          localStorage.setItem("accessToken", data?.tokens?.accessToken);
          localStorage.setItem("refreshToken", data?.tokens?.refreshToken);
          window.location.href = ACCOUNTS_ROUTE;
        } catch (err) {
          toast.error(err?.response?.data?.message);
        }

      }}>
        <p>
          <label htmlFor="id_username">Username:</label>
          <input type="text" name="name" maxLength="150" id="id_username"/>
        </p>
        <p>
          <label htmlFor="id_password">Password:</label>
          <input type="password" name="password" required id="id_password"/>
        </p>
        <p>Don't have an account? Create one <Link to={SIGN_UP_ROUTE}>here</Link></p>
        <button type="submit">
          Login
        </button>
      </form>
    </div>

  );
}

export default SignIn;
