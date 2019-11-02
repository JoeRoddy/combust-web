import React, { useContext, useState } from "react";

import Avatar from "../reusable/Avatar/Avatar";
import "./styles/Users.scss";
import { UserContext } from "../../context/UserContext";

export default function UserSearch({ history }) {
  const [state, updateState] = useState({
    results: [],
    query: "",
    isLoading: false,
    modalText: null
  });
  const { searchByField } = useContext(UserContext);

  const setState = newData => updateState({ ...state, ...newData });

  const searchForUsers = async query => {
    try {
      const results = await searchByField(query, "email");
      setState({ results, isLoading: false });
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        return prompt(
          "Install the user search feature first!\nIn the console, execute:",
          "combust install user-search"
        );
      }
    }
  };

  // searches for users after typing has halted for .3 seconds
  const handleSearchKeyUp = () => {
    let _searchTimeout;

    const { query } = state;
    clearTimeout(_searchTimeout);
    if (query !== "") {
      setState({ isLoading: true });
      _searchTimeout = setTimeout(() => searchForUsers(query), 300);
    } else {
      setState({ results: [], isLoading: false });
    }
  };

  const openProfile = user => {
    setState({ query: "", results: [] });
    history.push("/profile/" + user.id);
  };

  const { isLoading, query, results } = state;

  return (
    <div className="UserSearch">
      <form className="uk-search uk-search-default">
        <span uk-search-icon="true" uk-icon="icon: search" />
        <input
          className="uk-search-input"
          type="search"
          value={query}
          placeholder="Search for users.."
          onChange={e => setState({ query: e.target.value })}
          onKeyUp={handleSearchKeyUp}
          results={5}
        />
        {isLoading && (
          <div
            className="uk-form-icon uk-form-icon-flip"
            uk-spinner="ratio:.5"
          />
        )}
      </form>
      {results.length > 0 && (
        <UserSearchResults results={results} openProfile={openProfile} />
      )}
      {query !== "" && (
        <span
          className="onClickOutside"
          onClick={() => setState({ results: [], query: "" })}
        />
      )}
    </div>
  );
}

const UserSearchResults = ({ results, openProfile }) => (
  <div className="uk-card uk-card-default uk-card-body searchResults">
    {results.map((user, i) => {
      return (
        <div key={i}>
          <div
            onClick={() => openProfile(user)}
            className="userSearch-result uk-flex uk-flex-middle uk-text-truncate"
          >
            <Avatar src={user.iconUrl} height={30} />
            {user.displayName}
          </div>
        </div>
      );
    })}
  </div>
);
