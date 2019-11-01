import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Form from "../../reusable/Form";
import { UserContext } from "../../../context";

const fields = {
  //legal data types: string, text, number, boolean, image
  email: "string",
  password: "string"
};

export default function Register({ history }) {
  const [errMessage, setErrMessage] = useState("");

  const { user, createUserWithEmail } = useContext(UserContext);

  useEffect(() => {
    if (user) history.push("/");
  }, [user]);

  const handleSubmit = formData => {
    createUserWithEmail(formData, (err, userData) => {
      if (err) {
        setErrMessage(err.message);
      } else {
        history.push("/");
      }
    });
  };

  return (
    <div className="Register uk-flex uk-flex-center uk-margin">
      <Form
        onSubmit={handleSubmit}
        submitText="Sign Up"
        fields={fields}
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
