import React from "react";
import { render } from "react-dom";
import createBrowserHistory from "history/createBrowserHistory";
import { Router, withRouter } from "react-router-dom";
import "uikit/dist/css/uikit.css";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";
import firebase from "firebase/app";

import registerServiceWorker from "./helpers/registerServiceWorker";
import firebaseConfig from "./.combust/firebase.config.json";
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
