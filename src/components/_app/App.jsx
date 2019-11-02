import React from "react";

import Navbar from "../layout/Navbar/Navbar";
import Routes from "./Routes";
import "../../assets/styles/GlobalStyles.scss";

export default function App(props) {
  return (
    <div>
      <Navbar {...props} />
      <Routes {...props} />
    </div>
  );
}
