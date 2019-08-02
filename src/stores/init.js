import userStore from "./userStore";
import firebaseConfig from "../.combust/firebase.config.json";

export const stores = {
  userStore
};

export function initializeStores() {
  if (!firebaseConfig || !firebaseConfig.projectId) {
    return; //Firebase must be configured before initializing Combust stores
  }

  for (let storeName in stores) {
    const store = stores[storeName];
    store.init && store.init();
  }
}
