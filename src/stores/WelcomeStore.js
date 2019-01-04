import { observable } from "mobx";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";

class WelcomeStore {
  @observable firebaseConfigured = false;
  @observable emailAuthEnabled = false;
  @observable friendsAdded = false;
  @observable projectId = null;
  @observable currentStep = 1;

  isFirebaseConfigured() {
    try {
      firebase.database();
      const projectId = firebase.app().options.projectId;
      this.firebaseConfigured = true;
      this.projectId = projectId;
      this.currentStep = 2;
    } catch (err) {
      this.firebaseConfigured = false;
    }
  }

  isEmailAuthEnabled() {
    if (!this.firebaseConfigured) {
      return false;
    }
    const authEnabledForApp =
      firebase.app().options.projectId + "_emailAuthEnabled";

    const emailAuthVerified = JSON.parse(
      localStorage.getItem(authEnabledForApp)
    );

    if (emailAuthVerified) {
      this.emailAuthEnabled = true;
      return;
    }

    const testEmail = "comsttests@combust.com";
    firebase
      .auth()
      .createUserWithEmailAndPassword(testEmail, "sparky")
      .then(() => {
        localStorage.setItem(authEnabledForApp, true);
        this.emailAuthEnabled = true;
        this.currentStep = 4;
      })
      .catch(error => {
        this.emailAuthEnabled = error.code === "auth/email-already-in-use";
        this.currentStep = this.emailAuthEnabled ? 3 : 2;
        localStorage.setItem(authEnabledForApp, this.emailAuthEnabled);
      })
      .then(() => {
        const user = firebase.auth().currentUser;
        if (user && user.email === testEmail) {
          user.delete();
        }
      });
  }
}

const welcomeStore = new WelcomeStore();

export default welcomeStore;
