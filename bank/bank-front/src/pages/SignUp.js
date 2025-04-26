import { BASE_MSUSER_URL, SIGN_IN_ROUTE } from "../utils/const";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { joiValidate } from "../utils/joiValidate";
import Joi from "joi";
import axios from "axios";

const schema = Joi.object({
  name: Joi.string().min(6).max(32).regex(RegExp("^[A-Za-z0-9_-]+$"), "i"),
  email: Joi.string(),
  password: Joi.string().min(6),
  confirmPassword: Joi.string().min(6),
});

function SignUp(props) {
  return (
    <div className="sign-in">
      <h2>Welcome</h2>
      <form onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        if (password !== confirmPassword) {
          toast.error("Passwords doesnt match");
          return;
        }

        const isValid = joiValidate(schema, formData);
        if (!isValid) {
          return;
        }


        try {
          const { data } = await axios.post("/v1/auth/sign-up", {
            email: formData.get("email"),
            login: formData.get("name"),
            password: formData.get("password"),
          }, { baseURL: BASE_MSUSER_URL });
          window.location.href = SIGN_IN_ROUTE;
        } catch (error) {
          toast.error(error.response?.data);
        }


      }}>
        <p>
          <label htmlFor="id_username">Username:</label>
          <input type="text" name="name" maxLength="150" id="id_username"/>
        </p>
        <p>
          <label htmlFor="id_email">Email:</label>
          <input type="email" name="email" maxLength="320" id="id_email"/>
        </p>
        <p>
          <label htmlFor="id_password">Password:</label>
          <input type="password" name="password" id="id_password"/>
        </p>
        <p>
          <label htmlFor="id_confirmPassword">Confirm password:</label>
          <input type="password" name="confirmPassword" id="id_confirmPassword"/>
        </p>
        <p>Have an account? Login <Link to={SIGN_IN_ROUTE}>here</Link></p>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default SignUp;
