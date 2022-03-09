import { boot } from 'quasar/wrappers';
import { auth } from 'src/config/firebase';
import { useUserStore } from 'src/store/user';
import { onAuthStateChanged } from 'firebase/auth';

export default boot(async ({ router, store }) => {
  const userStore = useUserStore(store);

  // Keep the user state in store updated
  // Leave this observer listening for changes, do not unsubscribe
  onAuthStateChanged(auth, (firebaseUser) => {
    // Set the store
    if (firebaseUser) {
      userStore.setUser({
        displayName: firebaseUser.displayName,
        profilePhotoURL: firebaseUser.photoURL,
        email: firebaseUser.email,
        phoneNumber: firebaseUser.phoneNumber,
        uid: firebaseUser.uid,
      });
      userStore.setFirebaseUser(firebaseUser);
      console.log(firebaseUser);
    } else {
      userStore.$reset();
    }
  });

  // We await the auth's initialization before moving on
  await new Promise((resolve) => {
    const stopObverser = onAuthStateChanged(auth, (firebaseUser) => {
      // as soon as we resolve, the app init will continue and complete
      resolve(firebaseUser);
      // We no longer need this observer, stop it for performance and to avoid any possible problems
      stopObverser();
    });
  });

  // At this point, the auth is initialized, and the store has the user set.

  // Navigate based on user status
  router.beforeEach((to, from) => {
    // If auth is not required or we are at the login page, don't do anything
    if (!to.meta.requiresAuth || from.name === 'login') {
      return;
    }

    // If not logged in, redirect to login page
    // Note: Don't directly save the store to a variable to preserve reactivity.
    // Note: The conditional statement might look strange, but this is how we can check the object is empty: https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    if (Object.keys(userStore.user).length === 0) {
      return { name: 'login' };
    }
  });
});
