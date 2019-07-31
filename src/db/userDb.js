import firebase from "@firebase/app";
import "@firebase/database";
import "@firebase/auth";

class UserDb {
  createUserWithEmail(user, callback) {
    if (!user || !user.email || !user.password) {
      throw new Error(
        `UserDb.create(): requires a user object with an email && password`
      );
    }
    firebase
      .auth()
      .createUserWithEmailAndPassword(user.email, user.password)
      .then(res => {
        delete user.password;
        const userDataByPrivacy = {
          publicInfo: _getPublicUserObject(user),
          privateInfo: _getPrivateUserObject(),
          serverInfo: _getServerUserObject()
        };
        this.saveToUsersCollection(res.user.uid, userDataByPrivacy);
        userDataByPrivacy.id = res.user.uid;
        return callback(null, userDataByPrivacy);
      })
      .catch(error => {
        callback(error);
        console.log(error.message);
      });
  }

  /**
   * returns a promise representing the user's
   * publicInfo update, if it changed
   * @param {*} uid
   * @param {*} userDataByPrivacy
   */
  saveToUsersCollection(uid, userDataByPrivacy) {
    if (!uid || !userDataByPrivacy) {
      return;
    }
    return firebase
      .database()
      .ref(`/users/${uid}`)
      .update(userDataByPrivacy);
  }

  listenToCurrentUser(callback) {
    const db = firebase.database();
    firebase.auth().onAuthStateChanged(userAuth => {
      if (userAuth) {
        const userRef = db.ref(`users/${userAuth.uid}/publicInfo`);
        userRef.once("value").then(snap => {
          const userData = snap.val();
          // social login users will have {online:true, lastOnline:123} on initial creation
          const userHasData = userData && Object.keys(userData).length > 2;
          if (userHasData) {
            userRef.update({
              lastOnline: new Date().getTime(),
              isOnline: true
            });
            _applyListenersForCurrentUser(userAuth.uid, (err, data) => {
              if (err) return callback(err);
              data.id = userAuth.uid;
              callback(null, data);
            });
          } else if (
            (!userHasData || !snap.exists()) &&
            userAuth.providerData &&
            userAuth.providerData[0].providerId !== "password"
          ) {
            _createUserFromThirdPartyAuth(userAuth, callback);
          }
        });
      } else {
        callback(null, null);
      }
    });
  }

  listenToUser(userId, callback) {
    firebase
      .database()
      .ref(`users/${userId}/publicInfo`)
      .on("value", snapshot => {
        const friend = snapshot.val();
        if (!friend) {
          return callback(null, null);
        }
        friend.id = userId;
        callback(null, friend);
      });
  }

  login(user, callback) {
    const auth = firebase.auth();
    const db = firebase.database();
    auth.signInWithEmailAndPassword(user.email, user.password).then(
      res => {
        callback(null, res);
        const { uid } = res.user;
        db.ref("users/" + uid)
          .child("publicInfo")
          .update({
            isOnline: true
          });
      },
      err => {
        callback(err);
      }
    );
    _monitorOnlineStatus();
  }

  logout(user) {
    const auth = firebase.auth();
    if (!auth.currentUser) {
      return;
    }

    if (!user) {
      throw new Error("No user provided to logout");
    }
    auth.signOut();
    firebase
      .database()
      .ref("users/" + user.id)
      .child("publicInfo")
      .update({ isOnline: false, lastOnline: new Date().getTime() });
  }

  /**
   * used to verify the user when making HTTP requests
   * https://firebase.google.com/docs/auth/admin/verify-id-tokens
   */
  getAuthToken() {
    return firebase.auth().currentUser.getToken(/* forceRefresh */ true);
  }

  /**
   * hits the userSearch api
   * @param {string} query
   * @param {string} field
   * @returns {Promise} user search result (as an object)
   */
  searchByField(query, field) {
    const rootUrl = _getApiUrl(firebase.app().options.projectId);
    return fetch(`${rootUrl}/userSearch?query=${query}&field=${field}`).then(
      resp => resp.json()
    );
  }

  sendPasswordResetEmail(email) {
    return firebase.auth().sendPasswordResetEmail(email);
  }
}

const userDb = new UserDb();
export default userDb;

const _applyListenersForCurrentUser = function(uid, callback) {
  if (!uid) {
    throw new Error("no uid provided to listenToUser()");
  }

  ["publicInfo", "privateInfo", "serverInfo"].forEach(privacy => {
    firebase
      .database()
      .ref("users")
      .child(uid)
      .child(privacy)
      .on("value", snap => {
        let userData = snap.val();
        if (!userData) {
          callback("No user data found");
        } else {
          userData.id = uid;
        }
        callback(null, {
          id: uid,
          [privacy]: userData
        });
      });
  });

  _monitorOnlineStatus();
};

const _getPublicUserObject = function(values = {}) {
  //globally readable, user-writeable
  const timeNow = new Date().getTime();
  const defaultValues = {
    createdAt: timeNow,
    lastOnline: timeNow,
    isOnline: true,
    iconUrl: _getRandomProfilePic()
  };
  return Object.assign(defaultValues, values);
};

const _getPrivateUserObject = function(values = {}) {
  //user-only-readable, user-writeable
  const defaultValues = {
    conversations: {},
    friends: {},
    notificationToken: null,
    notificationsEnabled: true
  };
  return Object.assign(defaultValues, values);
};

const _getServerUserObject = function(values = {}) {
  //user-only-readable, server-only writeable
  //new fields should be validated in database.rules.json
  const defaultValues = {
    walletBalance: 0,
    isAdmin: false
  };
  return Object.assign(defaultValues, values);
};

const _monitorOnlineStatus = function() {
  const currentUser = firebase.auth().currentUser;
  if (!currentUser || !currentUser.uid) {
    return;
  }
  const uid = currentUser.uid;
  const amOnline = firebase.database().ref("/.info/connected");
  const userRef = firebase.database().ref(`/users/${uid}/publicInfo`);
  amOnline.on("value", snapshot => {
    if (snapshot.val()) {
      userRef.onDisconnect().update({
        isOnline: false,
        lastOnline: new Date().getTime()
      });
    }
  });
};

const _createUserFromThirdPartyAuth = function(authInfo, callback) {
  const { providerData, uid } = authInfo;
  const mainProviderInfo = providerData[0];
  const [firstName, lastName] = mainProviderInfo.displayName.split(" ");
  const timeNow = new Date().getTime();

  const publicInfo = {
    firstName,
    lastName,
    email: mainProviderInfo.email,
    iconUrl: mainProviderInfo.photoURL,
    createdAt: timeNow,
    lastOnline: timeNow,
    isOnline: true
  };
  const userDataByPrivacy = {
    publicInfo,
    privateInfo: _getPrivateUserObject({
      providerId: mainProviderInfo.providerId,
      providerUid: mainProviderInfo.uid,
      phoneNumber: mainProviderInfo.phoneNumber
    }),
    serverInfo: _getServerUserObject()
  };

  userDb
    .saveToUsersCollection(uid, userDataByPrivacy)
    .then(res => {
      _applyListenersForCurrentUser(uid, (err, data) => {
        if (err) return callback(err);
        data.id = uid;
        callback(null, data);
      });
    })
    .catch(err => {
      console.log("err saving user from social auth:", err);
    });
};

const _getRandomProfilePic = function() {
  const profilePics = [
    "https://firebasestorage.googleapis.com/v0/b/textable-92f65.appspot.com/o/dog1.jpeg?alt=media&token=320085e5-59a5-445e-a146-5411980e7a56",
    "https://firebasestorage.googleapis.com/v0/b/textable-92f65.appspot.com/o/dog2.jpeg?alt=media&token=54717b55-bbad-459e-8fb4-2dbf9caf76dd",
    "https://firebasestorage.googleapis.com/v0/b/textable-92f65.appspot.com/o/dog3.jpeg?alt=media&token=283db004-83d8-4857-84b4-7b0a61dc172f",
    "https://firebasestorage.googleapis.com/v0/b/textable-92f65.appspot.com/o/dog5.jpeg?alt=media&token=f3ce9b3d-34de-4124-aed2-67354220b9aa",
    "https://firebasestorage.googleapis.com/v0/b/textable-92f65.appspot.com/o/dog4.jpeg?alt=media&token=c7504834-c5e3-4081-8177-f013d8683f8d"
  ];

  return profilePics[Math.floor(Math.random() * profilePics.length)];
};

const _getApiUrl = projId => `https://us-central1-${projId}.cloudfunctions.net`;
