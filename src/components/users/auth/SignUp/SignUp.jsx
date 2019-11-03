import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Form from "../../../reusable/Form/Form";
import { UserContext } from "../../../../context";
import "./SignUp.scss";

export default function SignUp({ history }) {
  const [errMessage, setErrMessage] = useState("");
  const { user, createUserWithEmail } = useContext(UserContext);

  useEffect(() => {
    if (user) history.push("/");
  }, [user]);

  const createUser = formData => {
    createUserWithEmail(formData, (err, userData) => {
      err ? setErrMessage(err.message) : history.push("/");
    });
  };

  return (
    <div className="SignUp uk-flex uk-flex-center uk-margin">
      <Form
        onSubmit={createUser}
        submitText="Sign Up"
        fields={{ email: "string", password: "string" }}
        title="New Account"
      >
        <br />
        <Link to="/login">Login instead</Link>
        <div className="uk-text-danger uk-text-break uk-margin-small-top">
          {errMessage}
          {user && <div>You already have an account.</div>}
        </div>
      </Form>
    </div>
  );
}
