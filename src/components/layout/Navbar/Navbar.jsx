import React, { useContext } from "react";
import { Link } from "react-router-dom";

import { UserContext } from "../../../context";
import UserSearch from "../../users/UserSearch/UserSearch";
import * as iconURI from "../../../assets/images/logo.png";
import "./Navbar.scss";

export default function Navbar({ history }) {
  const { user, logout } = useContext(UserContext);
  return (
    <div
      className="Navbar"
      uk-sticky="sel-target: .uk-navbar-container; cls-active: uk-navbar-sticky; bottom: #transparent-sticky-navbar"
    >
      <nav className="uk-navbar-container" uk-navbar="true">
        <NavLeft />
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
            <UserSearch history={history} />
          </div>
        </div>
      </nav>
    </div>
  );
}

const NavLeft = () => {
  //This is a combust hook. Do not alter or rename additionalLinks
  const additionalLinks = [];
  const { userId } = useContext(UserContext);

  return (
    <div className="uk-navbar-left">
      <Link to="/">
        <img className="uk-navbar-item uk-logo" src={iconURI} alt="" />
        <span className="display-none accessibility">Go back to home</span>
      </Link>
      <div className="uk-navbar-item">
        <Link to="/">Home</Link>
      </div>
      {userId && (
        <div className="uk-navbar-item">
          <Link to={"/profile/" + userId}>My Profile</Link>
        </div>
      )}
      {userId &&
        additionalLinks &&
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
