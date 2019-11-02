import React, { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";

import Form from "../../reusable/Form/Form";
import { UserContext } from "../../../context/UserContext";

export default function Login({ history }) {
  const [errMessage, setErrMessage] = useState("");
  const { user, login } = useContext(UserContext);

  useEffect(() => {
    if (user) history.push("/");
  }, [user]);

  const onLogin = (err, userData) => {
    err ? setErrMessage(err.message) : history.push("/");
  };

  const loginWithEmail = formData => {
    login(formData, onLogin);
  };

  return (
    <div className="Register uk-flex uk-flex-column uk-flex-middle uk-margin">
      <Form
        onSubmit={loginWithEmail}
        fields={{ email: "string", password: "string" }}
        title="Login"
        submitText="Login"
      >
        <div className="uk-text-danger uk-text-break uk-margin-small-top">
          {errMessage}
        </div>
      </Form>
      <Link to="/register" className="uk-margin">
        Create an account
      </Link>
    </div>
  );
}
