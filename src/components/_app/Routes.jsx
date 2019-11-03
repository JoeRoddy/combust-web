import React from "react";
import { Switch, Route } from "react-router-dom";

import Welcome from "./Welcome";
import Login from "../users/auth/Login/Login";
import SignUp from "../users/auth/SignUp/SignUp";
import Profile from "../users/Profile/Profile";
import UpdateUser from "../users/UpdateUser/UpdateUser";

const Routes = () => (
  <Switch>
    <Route exact path="/" component={Welcome} />
    <Route path="/login" component={Login} />
    <Route path="/signup" component={SignUp} />
    <Route path="/profile/:userId" component={Profile} />
    <Route path="/updateUser" component={UpdateUser} />
  </Switch>
);

export default Routes;
