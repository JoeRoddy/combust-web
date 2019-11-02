import React, { useContext } from "react";
import { Link } from "react-router-dom";

import * as iconURI from "../../../assets/images/logo.png";
// import UserSearch from "../users/UserSearch";
import { UserContext } from "../../../context";
import "./Navbar.scss";

export default function Navbar({ history }) {
  const { user, logout } = useContext(UserContext);
  return (
    <div
      className="Navbar"
      uk-sticky="sel-target: .uk-navbar-container; cls-active: uk-navbar-sticky; bottom: #transparent-sticky-navbar"
    >
      <nav className="uk-navbar-container" uk-navbar="true">
        {renderNavLeft()}
        <div className="uk-navbar-right">
          {user && <div className="uk-navbar-item">{user.displayName}</div>}
          <div className="uk-navbar-item">
            {user ? (
              <Link onClick={logout} to="/login">
                Logout
              </Link>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>
          <div className="uk-navbar-item">
            {/* <UserSearch history={history} /> */}
          </div>
        </div>
      </nav>
    </div>
  );
}

const renderNavLeft = () => {
  //This is a combust hook. Do not alter additionalLinks
  const additionalLinks = [];
  const { userId } = useContext(UserContext);

  return (
    <div className="uk-navbar-left">
      <Link to="/">
        <img className="uk-navbar-item uk-logo" src={iconURI} alt="" />
      </Link>
      <div className="uk-navbar-item">
        <Link to="/">Home</Link>
      </div>
      {userId && (
        <div className="uk-navbar-item">
          <Link to={"/profile/" + userId}>My Profile</Link>
        </div>
      )}
      {additionalLinks &&
        userId &&
        additionalLinks.map((linkJsx, i) => {
          return (
            <div key={i} className="uk-navbar-item">
              {linkJsx}
            </div>
          );
        })}
    </div>
  );
};
