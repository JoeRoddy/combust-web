import React, { Component } from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";

import Form from "../../reusable/Form";
import userStore from "../../../stores/userStore";

@observer
class Login extends Component {
  state = {
    errMessage: ""
  };

  componentWillUpdate() {
    if (userStore.user) {
      this.props.history.push("/");
    }
  }

  loginWithEmail = formData => {
    userStore.login(formData, this.onLogin);
  };

  onLogin = (err, userData) => {
    err
      ? this.setState({ errMessage: err.message })
      : this.props.history.push("/");
  };

  render() {
    return (
      <div className="Register uk-flex uk-flex-column uk-flex-middle uk-margin">
        <Form
          onSubmit={this.loginWithEmail}
          fields={{ email: "string", password: "string" }}
          title="Login"
          submitText="Login"
        >
          <div className="uk-text-danger uk-text-break uk-margin-small-top">
            {this.state.errMessage}
          </div>
        </Form>
        <Link to="/register" className="uk-margin">
          Create an account
        </Link>
      </div>
    );
  }
}

export default Login;
