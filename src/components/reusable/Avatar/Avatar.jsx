import React from "react";

import "./Avatar.scss";

const Avatar = ({ src, height, width, onClick }) => {
  return (
    <img
      className="Avatar"
      src={src}
      style={{ height: height, width: width || height, borderRadius: "50%" }}
      onClick={e => onClick && onClick()}
      alt="User Avatar"
    />
  );
};

export default Avatar;
