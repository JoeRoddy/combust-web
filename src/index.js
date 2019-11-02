import React from "react";
import { render } from "react-dom";
import { createBrowserHistory } from "history";
import { Router, withRouter } from "react-router-dom";
import "uikit/dist/css/uikit.css";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";
import firebase from "firebase/app";

import { Providers } from "./context";
import { register } from "./helpers/serviceWorkerHelper";
import firebaseConfig from "./db/firebase.config.json";
import App from "./components/_app/App";

UIkit.use(Icons);
firebaseConfig && firebase.initializeApp(firebaseConfig);

const browserHistory = createBrowserHistory();
const AppWrapper = withRouter(App);

render(
  <RootProvider providers={Providers}>
    <Router history={browserHistory}>
      <AppWrapper />
    </Router>
  </RootProvider>,
  document.getElementById("root")
);

register();

// Nests an arbitrary number of providers, prevent provider spaghetti
function RootProvider({ providers = [], children }) {
  return providers.reduce((jsx, P) => <P>{jsx}</P>, children);
}
