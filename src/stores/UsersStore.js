import { observable, computed } from "mobx";
import usersService from "../service/UsersService";

class UsersStore {
  @observable userId = null;
  @observable usersMap = new Map();

  @observable privateInfo = null; //only reads/writes by user
  @observable serverInfo = null; //only user reads, only server writes

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

  @computed
  get user() {
    return this.usersMap.get(this.userId);
  }

  @computed
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
    usersService.login(user, callback);
  }

  /**
   * logs out the current user
   */
  logout() {
    usersService.logout(this.user);
  }

  /**
   * creates a user with an email and password
   * callback called w/args: err, res
   * @param {Object} user
   * @param {string} user.email
   * @param {string} user.password
   * @param {*} callback
   */
  createUser(user, callback) {
    if (!user || !user.email || !user.password) {
      debugger;
      return callback({
        message: "You must provide an email and password"
      });
    }

    usersService.createUser(user, (err, userDataByPrivacy) => {
      if (err) return callback(err);
      _saveCurrentUserLocally(userDataByPrivacy);
      callback(err, userDataByPrivacy);
    });
  }

  /**
   * find a user already stored in memory by a specific field
   * @param {string} field
   * @param {string} query
   */
  searchFromLocalUsersByField(field, query) {
    let results = [];
    this.usersMap.entries().forEach(([uid, user]) => {
      if (
        user &&
        typeof user[field] === "string" &&
        user[field].toUpperCase().includes(query.toUpperCase())
      ) {
        results.push(user);
      }
    });
    return results;
  }
}

const usersStore = new UsersStore();
export default usersStore;

//Private members. Not accessible from views.

let _onLoginTriggers = [];
let _onLogoutTriggers = [];

const _listenToCurrentUser = function() {
  usersService.listenToCurrentUser((err, userData) => {
    if (err) {
      debugger;
      return;
    } else if (!userData) {
      //user logged out
      if (usersStore.userId) {
        _handleUserLogout();
      }
      usersStore.userId = null;
    } else {
      //new data
      let shouldExecEstablished = !usersStore.user && userData.publicInfo;
      _saveCurrentUserLocally(userData);
      if (shouldExecEstablished) {
        _handleUserEstablished();
      }
    }
  });
};

const _updateUser = function() {
  const user = this;
  const uid = user.id;
  delete user.save;
  delete user.id;
  usersService.saveToUsersCollection(uid, { publicInfo: user });
};

const _handleUserLogout = function() {
  const user = usersStore.fullUser;
  //module hooks
  try {
    _onLogoutTriggers.forEach(event => {
      event(user);
    });
  } catch (err) {
    debugger;
  }
};

const _handleUserEstablished = function() {
  const user = usersStore.fullUser;
  //module hooks
  try {
    _onLoginTriggers.forEach(event => {
      event(user);
    });
  } catch (err) {
    console.log(err);
  }
};

const _saveCurrentUserLocally = function(userDataByPrivacy) {
  const { id, publicInfo, privateInfo, serverInfo } = userDataByPrivacy;
  if (publicInfo) {
    publicInfo.save = _updateUser;
    _savePublicUserInfo(id, publicInfo);
  }
  if (privateInfo) {
    usersStore.privateInfo = privateInfo;
  }
  if (serverInfo) {
    usersStore.serverInfo = serverInfo;
  }
  usersStore.userId = id;
};

const _listenToPublicUserData = function(userId) {
  usersService.listenToUser(userId, (err, user) => {
    _savePublicUserInfo(userId, user);
  });
};

const _savePublicUserInfo = function(userId, user) {
  if (!user) {
    return;
  }
  user.displayName = user.email;
  user.id = userId;
  usersStore.usersMap.set(userId, user);
};
