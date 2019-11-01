import React from "react";

import Avatar from "../reusable/Avatar";

const UserList = ({ users, onUserClicked }) => {
  return (
    <div>
      {users &&
        Object.keys(users).map(userId => (
          <UserListItem
            user={users[userId]}
            key={userId}
            onClick={onUserClicked}
          />
        ))}
    </div>
  );
};

export default UserList;

const UserListItem = ({ onClick, user }) =>
  user ? (
    <div
      onClick={() => onClick(user)}
      className="User uk-flex uk-flex-between uk-flex-nowrap uk-flex-middle"
    >
      <span className="avatarAndName">
        <Avatar src={user.iconUrl} height={30} />
        <span className="userName">{user.displayName}</span>
      </span>
      <span className={"isOnline " + (user.isOnline ? "online" : "offline")} />
    </div>
  ) : (
    <span />
  );
