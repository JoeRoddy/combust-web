import React, { useContext, useEffect, useState } from "react";

import { UserContext } from "../../../context/UserContext";
import Avatar from "../../reusable/Avatar/Avatar";
import Input from "../../reusable/Input/Input";
import "./UserSearch.scss";

let _searchTimeout;

export default function UserSearch({ history }) {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { searchByField } = useContext(UserContext);

  const searchForUsers = async query => {
    try {
      const results = await searchByField(query, "email");
      console.log(results);
      setResults(results);
      setIsLoading(false);
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
    clearTimeout(_searchTimeout);
    if (query !== "") {
      setIsLoading(true);
      _searchTimeout = setTimeout(() => searchForUsers(query), 300);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  };

  const openProfile = user => {
    setQuery("");
    setResults([]);
    history.push("/profile/" + user.id);
  };

  useEffect(() => {
    return () => clearTimeout(_searchTimeout);
  }, []);

  return (
    <div className="UserSearch">
      <form className="uk-search uk-search-default">
        <span uk-search-icon="true" />
        <Input
          className="uk-search-input"
          type="search"
          value={query}
          placeholder="Search for users.."
          onChange={e => setQuery(e.target.value)}
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
          className="on-click-outside"
          onClick={() => {
            setResults([]);
            setQuery("");
          }}
        />
      )}
    </div>
  );
}

const UserSearchResults = ({ results, openProfile }) => (
  <div className="uk-card uk-card-default uk-card-body searchResults">
    {results.length ? (
      results.map((user, i) => (
        <div key={i}>
          <div
            onClick={() => openProfile(user)}
            className="userSearch-result uk-flex uk-flex-middle uk-text-truncate"
          >
            <Avatar src={user.iconUrl} height={30} />
            {user.displayName}
          </div>
        </div>
      ))
    ) : (
      <div>
        <div className="userSearch-result uk-flex uk-flex-middle uk-text-truncate">
          No results
        </div>
      </div>
    )}
  </div>
);
