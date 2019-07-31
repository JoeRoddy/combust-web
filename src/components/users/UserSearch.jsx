import React, { Component } from "react";
import { observer } from "mobx-react";

import userStore from "../../stores/userStore";
import Avatar from "../reusable/Avatar";
import "./styles/Users.scss";

@observer
class UserSearch extends Component {
  state = {
    results: [],
    query: "",
    isLoading: false,
    modalText: null
  };

  _searchTimeout;

  // searches for users after typing has halted for .3 seconds
  handleSearchKeyUp = () => {
    const { query } = this.state;
    clearTimeout(this._searchTimeout);
    if (query !== "") {
      this.setState({ isLoading: true });
      this._searchTimeout = setTimeout(() => this.searchForUsers(query), 300);
    } else {
      this.setState({ results: [], isLoading: false });
    }
  };

  searchForUsers = async query => {
    try {
      const results = await userStore.searchByField(query, "email");
      this.setState({ results, isLoading: false });
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        return prompt(
          "Install the user search feature first!\nIn the console, execute:",
          "combust install user-search"
        );
      }
    }
  };

  openProfile = user => {
    this.setState({ query: "", results: [] });
    this.props.history.push("/profile/" + user.id);
  };

  render() {
    const { isLoading, query, results } = this.state;

    return (
      <div className="UserSearch">
        <form className="uk-search uk-search-default">
          <span uk-search-icon="true" uk-icon="icon: search" />
          <input
            className="uk-search-input"
            type="search"
            value={query}
            placeholder="Search for users.."
            onChange={e => this.setState({ query: e.target.value })}
            onKeyUp={this.handleSearchKeyUp}
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
          <UserSearchResults results={results} openProfile={this.openProfile} />
        )}
        {query !== "" && (
          <span
            className="onClickOutside"
            onClick={() => this.setState({ results: [], query: "" })}
          />
        )}
      </div>
    );
  }
}

export default UserSearch;

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
