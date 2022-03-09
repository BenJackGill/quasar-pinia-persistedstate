/* eslint-disable @typescript-eslint/no-this-alias */
import { defineStore } from 'pinia';
import { User } from 'src/types';
import { User as FirebaseUser } from 'firebase/auth';
import { useUpdateDocTask, useGetDocTask } from 'src/composables/database';
import { useTask } from 'vue-concurrency';

const updateDocTask = useUpdateDocTask();
const getDocTask = useGetDocTask();

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      user: {} as User,
      firebaseUser: {} as FirebaseUser,
    };
  },
  persist: true,
  actions: {
    setUser(user: User) {
      this.user = user;
    },
    setFirebaseUser(firebaseUser: FirebaseUser) {
      this.firebaseUser = firebaseUser;
    },
    setFirstName() {
      const state = this;
      return useTask(function* (signal, firstName: string) {
        yield updateDocTask.perform('users', state.user.uid, {
          firstName,
        });
        state.user.firstName = firstName;
        console.log('firstName set in Pinia:', state.user.firstName);
      });
    },
    getFirstName() {
      const state = this;
      return useTask(function* () {
        if (!state.user.firstName) {
          console.log('firstName is not found in Pinia:', state.user.firstName); // This is always undefined
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const user: Record<string, unknown> = yield getDocTask.perform(
            'users',
            state.user.uid
          );
          state.user.firstName = user.firstName as string;
          console.log('firstName set in Pinia:', state.user.firstName); // This correctly sets the name to the Pinia store
          return state.user.firstName;
        } else {
          console.log('firstName retrieved from Pinia:', state.user.firstName);
          return state.user.firstName;
        }
      });
    },
  },
});
