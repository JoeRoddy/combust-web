import React from "react";

import Navbar from "./Navbar";
import Routes from "./Routes";
import "../../assets/styles/GlobalStyles.scss";
import "../reusable/styles/Reusable.scss";

export default function App(props) {
  return (
    <div>
      <Navbar {...props} />
      <Routes {...props} />
    </div>
  );
}
