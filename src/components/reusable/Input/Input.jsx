import React from "react";

import "./Input.scss";

const Input = props => {
  const accessibility = props.accessibility || props.placeholder;

  return (
    <>
      <input {...props} id={accessibility} />
      <label className="display-none" for={accessibility}>
        {accessibility}
      </label>
    </>
  );
};

export default Input;
