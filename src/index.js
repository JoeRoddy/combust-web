import React from "react";
import { render } from "react-dom";
import createBrowserHistory from "history/createBrowserHistory";
import { Router, withRouter } from "react-router-dom";
import "uikit/dist/css/uikit.css";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";
import firebase from "firebase";

import registerServiceWorker from "./helpers/registerServiceWorker";
import { firebaseConfig } from "./.combust/config";
import { initializeStores } from "./.combust/init";
import App from "./components/App";

UIkit.use(Icons);
firebaseConfig && firebase.initializeApp(firebaseConfig);

const browserHistory = createBrowserHistory();
const AppWrapper = withRouter(App);

render(
  <Router history={browserHistory}>
    <AppWrapper />
  </Router>,
  document.getElementById("root")
);

registerServiceWorker();
initializeStores();
