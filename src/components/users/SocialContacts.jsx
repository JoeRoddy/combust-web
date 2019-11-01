import React, { useContext, useState } from "react";

import { UserContext } from "../../context";
import "./styles/Users.scss";

const componentsByMode = {};

export default function SocialContacts({ history }) {
  const [mode, setMode] = useState(Object.keys(componentsByMode)[0]);
  const { user } = useContext(UserContext);
  if (!mode || !user) return <span />;

  const socialModes = Object.keys(componentsByMode);
  const isDropdownShown = socialModes && socialModes.length > 1;

  return (
    <div className="SocialContacts uk-position-right">
      <div className="uk-inline">
        <h4>
          {mode}
          {isDropdownShown && <span uk-icon="icon: triangle-down"> </span>}
        </h4>
        {isDropdownShown && (
          <div uk-dropdown="pos: bottom-justify">
            <ul className="uk-nav uk-dropdown-nav">
              {socialModes.map((socialMode, i) =>
                mode !== socialMode ? (
                  <li key={i}>
                    <EmptyLink mode={socialMode} setMode={setMode} />
                  </li>
                ) : null
              )}
            </ul>
          </div>
        )}
      </div>
      {componentsByMode[mode](history)}
    </div>
  );
}

const EmptyLink = ({ mode, setMode }) => (
  // eslint-disable-next-line
  <a onClick={() => setMode(mode)}>{mode}</a>
);
