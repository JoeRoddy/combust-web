import React from "react";
import { Switch, Route } from "react-router-dom";

import Login from "./users/auth/Login";
import Register from "./users/auth/Register";
import Welcome from "./Welcome";
import Profile from "./users/Profile";
import UpdateUser from "./users/UpdateUser";

const Routes = props => {
  let welcomeWrapper = () => <Welcome {...props} />;

  return (
    <Switch>
      <Route exact path="/" component={welcomeWrapper} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile/:userId" component={Profile} />
      <Route path="/updateUser" component={UpdateUser} />
    </Switch>
  );
};

export default Routes;
