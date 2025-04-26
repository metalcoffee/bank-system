import {toast} from "react-toastify";

export function joiValidate(schema, formData) {
  const data = Object.fromEntries(formData);

  const {error} = schema.validate(data);
  if (error) {
    toast.error(error.message);
    return false;
  } else {
    return true;
  }
}
