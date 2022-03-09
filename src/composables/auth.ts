/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { auth, timestamp } from 'src/config/firebase';
import {
  signInWithEmailAndPassword,
  UserCredential,
  fetchSignInMethodsForEmail,
  updateProfile,
  updateEmail,
  RecaptchaVerifier,
  PhoneAuthProvider,
  unlink,
  linkWithCredential,
  createUserWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { useStorageUploadTask } from 'src/composables/storage';
import { useTask } from 'vue-concurrency';
import { useUserStore } from 'src/store/user';
import { useUpdateDocTask } from './database';
import { LocalStorage } from 'quasar';
import { useRouter, RouteLocationRaw } from 'vue-router';

const userStore = useUserStore();

export const useCreateUserWithEmailAndPasswordTask = () => {
  const router = useRouter();
  const updateDocTask = useUpdateDocTask();
  return useTask(function* (
    signal,
    email: string,
    password: string,
    displayName: string,
    firstName: string,
    lastName: string,
    routeLocation?: RouteLocationRaw
  ) {
    const userCredential: UserCredential = yield createUserWithEmailAndPassword(
      auth,
      email,
      password
    ).catch((err) => {
      if (err instanceof Error) {
        if (err.message.includes('auth/email-already-in-use')) {
          throw new Error(
            'Email already in use. Please sign in or use another.'
          );
        } else if (err.message.includes('auth/weak-password')) {
          throw new Error(
            'Password too weak. Please choose a stronger password.'
          );
        }
      }
    });
    const updateUser: void = yield updateProfile(userCredential.user, {
      displayName,
    });
    const updateDoc: void = yield updateDocTask.perform(
      'users',
      userCredential.user.uid,
      {
        firstName: firstName,
        lastName: lastName,
        createdAt: timestamp,
      }
    );
    userStore.setUser({
      firstName: firstName,
      lastName: lastName,
      displayName: displayName,
      profilePhotoURL: undefined,
      email: email,
      phoneNumber: undefined,
      uid: userCredential.user.uid,
    });
    userStore.setFirebaseUser(userCredential.user);
    if (routeLocation) {
      yield router.push(routeLocation);
    }
    return Promise.all([userCredential, updateUser, updateDoc]);
  });
};

export const useSignOutTask = () => {
  const router = useRouter();
  return useTask(function* (signal, routeLocation?: RouteLocationRaw) {
    yield signOut(auth);
    LocalStorage.clear();
    if (routeLocation) {
      yield router.push(routeLocation);
    }
  });
};

export const useSignInWithEmailAndPasswordTask = () => {
  const router = useRouter();
  return useTask(function* (
    signal,
    email: string,
    password: string,
    routeLocation?: RouteLocationRaw
  ) {
    const userCredential: UserCredential = yield signInWithEmailAndPassword(
      auth,
      email,
      password
    ).catch((err) => {
      if (err instanceof Error) {
        if (err.message.includes('auth/user-not-found')) {
          throw new Error('User not found.');
        } else if (err.message.includes('auth/wrong-password')) {
          throw new Error('Wrong password.');
        }
      }
    });
    if (routeLocation) {
      yield router.push(routeLocation);
    }
    return userCredential;
  });
};

export const useCheckIsEmailSignedUpTask = () => {
  return useTask(function* (signal, email: string) {
    const providers: string[] = yield fetchSignInMethodsForEmail(auth, email);
    if (providers.length === 0) {
      // email hasn't signed up
      return false;
    } else {
      // email already signed up
      return true;
    }
  });
};

export const useReauthEmailAndPasswordTask = () => {
  return useTask(function* (signal, email: string, password: string) {
    const credential = EmailAuthProvider.credential(email, password);

    const response: UserCredential = yield reauthenticateWithCredential(
      userStore.firebaseUser,
      credential
    );
    return response;
  });
};

// DO NOT use this as part of a "forgot passsword" email reset flow. Use the other functions below for that.
// This is for updating the password while user is logged into the app.
export const useUpdatePasswordTask = () => {
  return useTask(function* (signal, newPassword: string) {
    const response: void = yield updatePassword(
      userStore.firebaseUser,
      newPassword
    );
    return response;
  });
};

export const useSendPasswordResetEmailTask = () => {
  return useTask(function* (signal, email: string) {
    yield sendPasswordResetEmail(auth, email);
  });
};

export const useConfirmPasswordResetTask = () => {
  const router = useRouter();
  return useTask(function* (
    signal,
    oobCode: string,
    newPassword: string,
    routeLocation?: RouteLocationRaw
  ) {
    yield confirmPasswordReset(auth, oobCode, newPassword);
    if (routeLocation) {
      yield router.push(routeLocation);
    }
  });
};

export const useVerifyPasswordResetCodeTask = () => {
  return useTask(function* (signal, oobCode: string) {
    const userEmail: string = yield verifyPasswordResetCode(auth, oobCode);
    return userEmail;
  });
};

// export const useUpdateProfilePhotoTask = () => {
//   return useTask(function* (signal, photoFile?: File) {
//     if (photoFile === undefined) {
//       yield updateProfile(userStore.firebaseUser, {
//         photoURL: '',
//       });
//     } else {
//       const storageUploadTask = useStorageUploadTask();
//       const downloadURL: string = yield storageUploadTask.perform(
//         'image',
//         photoFile
//       );
//       yield updateProfile(userStore.firebaseUser, {
//         photoURL: downloadURL,
//       });
//       return downloadURL;
//     }
//   });
// };

export const useUpdateProfileTask = () => {
  return useTask(function* (
    signal,
    profile: {
      displayName?: string;
      photoFile?: File | null;
    }
  ) {
    if (profile.photoFile && profile.photoFile instanceof File) {
      const storageUploadTask = useStorageUploadTask();
      const downloadURL: string = yield storageUploadTask.perform(
        'image',
        profile.photoFile
      );
      yield updateProfile(userStore.firebaseUser, {
        displayName: profile.displayName,
        photoURL: downloadURL,
      });
      return downloadURL;
    } else if (profile.photoFile && profile.photoFile === null) {
      yield updateProfile(userStore.firebaseUser, {
        displayName: profile.displayName,
        photoURL: '',
      });
      return undefined;
    }
    if (profile.displayName) {
      yield updateProfile(userStore.firebaseUser, {
        displayName: profile.displayName,
      });
      return undefined;
    }

    // if (profile.photoFile === undefined) {
    //   yield updateProfile(userStore.firebaseUser, {
    //     photoURL: '',
    //   });
    // } else {
    //   const storageUploadTask = useStorageUploadTask();
    //   const downloadURL: string = yield storageUploadTask.perform(
    //     'image',
    //     photoFile
    //   );
    //   yield updateProfile(userStore.firebaseUser, {
    //     photoURL: downloadURL,
    //   });
    //   return downloadURL;
    // }
  });
};

// export const useUpdateUserProfileTask = () => {
//   return useTask(function* (
//     signal,
//     profile: {
//       displayName?: string;
//       photoFile?: File | null;
//     }
//   ) {
//     if (profile.displayName) {
//       yield updateProfile(userStore.firebaseUser, {
//         displayName: profile.displayName,
//       });
//     }
//     if (profile.photoFile === null) {
//       yield updateProfile(userStore.firebaseUser, {
//         photoURL: '',
//       });
//     }
//     if (profile.photoFile) {
//       // const uploadImageRef: Ref<{
//       //   downloadURL?: string | undefined;
//       //   progress?: number | undefined;
//       //   error?: unknown;
//       //   isCanceled: boolean;
//       //   isRunning: boolean;
//       //   isPaused: boolean;
//       //   isSuccess: boolean;
//       //   isError: boolean;
//       // }> = yield useUploadImage(profile.photoFile);
//       yield updateProfile(userStore.firebaseUser, {
//         //photoURL: uploadImageRef.value.downloadURL,
//       });
//       //return uploadImageRef;
//     }
//   });
// };

export const useUpdateUserEmailTask = () => {
  return useTask(function* (signal, email: string) {
    yield updateEmail(userStore.firebaseUser, email);
  });
};

// export const useSetInvisibleRecaptchaOnWindowTask = () => {
//   return useTask(function* (signal, recaptchaId: string) {
//     window.recaptchaVerifier = new RecaptchaVerifier(
//       recaptchaId,
//       { size: 'invisible' },
//       auth
//     );

//     window.recaptchaWidgetId = yield window.recaptchaVerifier.render();
//   });
// };

export const useResetReCaptchaOnWindow = () => {
  if (
    typeof grecaptcha !== 'undefined' &&
    typeof window.recaptchaWidgetId !== 'undefined'
  ) {
    //grecaptcha.reset(window.recaptchaWidgetId);
  }
};

export const useSendSMSOtpTask = () => {
  return useTask(function* (
    signal,
    phoneE164Standard: string,
    recaptchaConatinerId: string
  ) {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        recaptchaConatinerId,
        { size: 'invisible' },
        auth
      );
      window.recaptchaWidgetId = yield window.recaptchaVerifier.render();
    }
    const provider = new PhoneAuthProvider(auth);
    const verificationId: string = yield provider.verifyPhoneNumber(
      phoneE164Standard,
      window.recaptchaVerifier
    );
    return verificationId;
  });
};

export const useVerifySMSOtpAndLinkPhoneTask = () => {
  return useTask(function* (
    signal,
    verificationId: string,
    verificationCode: string
  ) {
    const phoneCredential = PhoneAuthProvider.credential(
      verificationId,
      verificationCode
    );
    if (userStore.firebaseUser && userStore.firebaseUser.phoneNumber) {
      // Remove existing phone then add new phone
      yield unlink(userStore.firebaseUser, 'phone');
      yield linkWithCredential(userStore.firebaseUser, phoneCredential);
    } else if (userStore.firebaseUser) {
      // Add new phone
      yield linkWithCredential(userStore.firebaseUser, phoneCredential);
    }
    return userStore.firebaseUser.phoneNumber;
  });
};
