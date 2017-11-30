import { observable, computed } from "mobx";
import followerService from "../service/FollowerService";

//DEPENDENCIES
import userStore from "./UserStore";

class FollowerStore {
  subscribeToEvents() {
    //must be inline functions, or use .bind(this)
    userStore.onLogin(this.performInitialLoad.bind(this));
    userStore.onLogout(this.onUserLogout.bind(this));
  }

  @observable followedIdsMap = new Map();
  @observable followerIdsMap = new Map();

  isInitialLoadComplete = false;
  performInitialLoad(user) {
    if (this.isInitialLoadComplete) {
      return;
    }
    followerService.listenToFollowers(user.id, (err, follower) => {
      err ? console.log(err) : this.storeFollower(follower.id, follower);
    });
    followerService.listenToFollowed(user.id, (err, userBeingFollowed) => {
      err
        ? console.log(err)
        : this.storeFollowed(userBeingFollowed.id, userBeingFollowed);
    });
    this.isInitialLoadComplete = true;
  }

  storeFollower(userId, user) {
    userStore.saveUserLocally(userId, user);
    this.followerIdsMap.set(userId, true);
  }

  storeFollowed(userId, user) {
    userStore.saveUserLocally(userId, user);
    this.followedIdsMap.set(userId, true);
  }

  isFollower(userId) {
    return this.followerIdsMap.has(userId);
  }

  isFollowing(userId) {
    return this.followedIdsMap.has(userId);
  }

  followUser(influencerId) {
    followerService.followUser(influencerId, userStore.userId);
  }

  unfollowUser(influencerId) {
    followerService.unfollowUser(influencerId, userStore.userId);
  }

  @computed
  get followers() {
    let followers = {};
    Array.from(this.followerIdsMap.keys()).forEach(uid => {
      followers[uid] = userStore.getUserById(uid);
    });
    return followers;
  }

  @computed
  get usersBeingFollowed() {
    let usersBeingFollowed = {};
    Array.from(this.followedIdsMap.keys()).forEach(uid => {
      usersBeingFollowed[uid] = userStore.getUserById(uid);
    });
    return usersBeingFollowed;
  }

  onFollowerClickedTriggers = [];
  onFollowerClicked = func => {
    this.onFollowerClickedTriggers.push(func);
  };

  handleFollowerClick(follower) {
    this.onfollowerClickedTriggers.length > 0
      ? this.onfollowerClickedTriggers.forEach(event => {
          event(follower);
        })
      : alert(
          "follower clicked, add the chat module or create your own handler.\n\nie: \nfollowerStore.onfollowerClicked(follower =>{\n\talert('do stuff'))\n}"
        );
  }

  onUserLogout(user) {
    this.followedIdsMap.clear();
    this.followerIdsMap.clear();
    this.isInitialLoadComplete = false;
  }
}

const followerStore = new FollowerStore();
export default followerStore;
