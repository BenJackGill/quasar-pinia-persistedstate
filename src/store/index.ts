/* eslint-disable @typescript-eslint/no-unused-vars */
import { store } from 'quasar/wrappers';
import { createPinia, Pinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

declare module '@quasar/app' {
  interface BootFileParams<TState> {
    store: Pinia;
  }
  interface PreFetchOptions<TState> {
    store: Pinia;
  }
}

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    //$store: Pinia;
    $store: import('pinia').Pinia;
  }
}

export default store(function (_) {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  return pinia;
});
