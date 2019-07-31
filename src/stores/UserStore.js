import { decorate, observable, computed } from "mobx";

import userDb from "../db/UserDb";

class UserStore {
  userId = null;
  usersMap = new Map(); // map of publicInfo for each user
  privateInfo = null; //only reads/writes by user
  serverInfo = null; //only user reads, only server writes

  init() {
    _listenToCurrentUser();
  }

  /**
   * callback executed when the user logs in, args: user
   * @param {function} callback
   */
  onLogin(callback) {
    _onLoginTriggers.push(callback);
  }

  /**
   * callback executed when the user logs out, args: user
   * @param {function} callback
   */
  onLogout(callback) {
    _onLogoutTriggers.push(callback);
  }

  get user() {
    return this.usersMap.get(this.userId);
  }

  get fullUser() {
    return {
      id: this.userId,
      public: this.user,
      private: this.privateInfo,
      server: this.serverInfo
    };
  }

  /**
   * returns the public user info from a given user id
   * & applies a listener to their data
   * @param {string} userId
   */
  getUserById(userId) {
    const user = this.usersMap.get(userId);
    if (!user) {
      _listenToPublicUserData(userId);
    }
    return user;
  }

  /**
   * logs in a user with an email and password
   * callback called w/ args: err, res
   * @param {Object} user
   * @param {string} user.email
   * @param {string} user.password
   * @param {function} callback
   */
  login(user, callback) {
    userDb.login(user, callback);
  }

  /**
   * logs out the current user
   */
  logout() {
    _handleUserLogout();
    userDb.logout(this.user);
    this.userId = null;
  }

  /**
   * creates a user with an email and password
   * callback called w/args: err, res
   * @param {Object} user
   * @param {string} user.email
   * @param {string} user.password
   * @param {function} callback
   */
  createUserWithEmail(user, callback) {
    if (!user || !user.email || !user.password) {
      return callback({
        message: "You must provide an email and password"
      });
    }

    userDb.createUserWithEmail(user, (err, userDataByPrivacy) => {
      if (err) return callback(err);
      _saveCurrentUserLocally(userDataByPrivacy);
      callback(err, userDataByPrivacy);
    });
  }

  /**
   * find a user by a publicInfo field
   * @param {string} query
   * @param {string} field
   */
  async searchByField(query, field) {
    let results = await userDb.searchByField(query, field);
    debugger;
    results = results || {};
    let formattedResults = [];
    Object.keys(results).forEach(uid => {
      if (uid !== this.userId) {
        this.getUserById(uid); // apply a listener
        const formattedUser = _savePublicUserInfo(uid, results[uid]);
        formattedResults.push(formattedUser);
      }
    });
    return formattedResults;
  }

  /**
   * sends a reset email to an email address if the account exists
   * @returns {Promise} password reset result
   */
  sendPasswordResetEmail(email) {
    return userDb.sendPasswordResetEmail(email);
  }
}

decorate(UserStore, {
  userId: observable,
  usersMap: observable,
  privateInfo: observable,
  serverInfo: observable,
  user: computed,
  fullUser: computed
});

const userStore = new UserStore();
export default userStore;

//Private members. Not accessible from views.

let _onLoginTriggers = [];
let _onLogoutTriggers = [];

const _listenToCurrentUser = function() {
  userDb.listenToCurrentUser((err, userData) => {
    if (err) {
      return console.log(err);
    } else if (!userData && userStore.userId) {
      //user logged out
      _handleUserLogout();
      userStore.userId = null;
    } else {
      //new data
      let shouldExecEstablished = !userStore.user && userData.publicInfo;
      _saveCurrentUserLocally(userData);
      if (shouldExecEstablished) {
        _handleUserEstablished({
          id: userData.publicInfo.id,
          publicInfo: userData.publicInfo
        });
      }
    }
  });
};

const _updateUser = function() {
  const user = this;
  const uid = user.id;
  delete user.save;
  delete user.id;
  delete user.displayName;
  userDb.saveToUsersCollection(uid, { publicInfo: user });
  _savePublicUserInfo(uid, user); //reapply deleted properties
};

const _handleUserLogout = function() {
  const user = userStore.fullUser;
  //module hooks
  try {
    _onLogoutTriggers.forEach(event => {
      event(user);
    });
  } catch (err) {
    debugger;
  }
};

const _handleUserEstablished = function(user) {
  //module hooks
  try {
    _onLoginTriggers.forEach(event => event(user));
  } catch (err) {
    console.log(err);
  }
};

const _saveCurrentUserLocally = function(userDataByPrivacy) {
  const { id, publicInfo, privateInfo, serverInfo } = userDataByPrivacy;
  if (publicInfo) {
    _savePublicUserInfo(id, publicInfo);
    if (publicInfo && publicInfo.isOnline) {
      userStore.userId = id;
    }
  }
  if (privateInfo) {
    userStore.privateInfo = privateInfo;
  }
  if (serverInfo) {
    userStore.serverInfo = serverInfo;
  }
};

const _listenToPublicUserData = function(userId) {
  userDb.listenToUser(userId, (err, user) => {
    _savePublicUserInfo(userId, user);
  });
};

const _savePublicUserInfo = function(userId, user) {
  if (!user) {
    return;
  }
  user.displayName = user.email;
  user.save = _updateUser;
  user.id = userId;
  userStore.usersMap.set(userId, user);
  return user;
};
