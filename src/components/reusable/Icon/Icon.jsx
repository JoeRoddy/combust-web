import React from "react";

import "./Icon.scss";

const Icon = props => {
  //eslint-disable-next-line
  return <a className="Icon" uk-icon={"icon: " + props.type} {...props} />;
};

export default Icon;
