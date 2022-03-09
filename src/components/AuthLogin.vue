<template>
  <q-card class="full-width" style="max-width: 300px">
    <q-card-section>
      <!-- Login Form -->
      <q-form @submit="handleSubmit">
        <h5 class="text-center q-mt-md q-mb-lg">Log in to your account</h5>
        <v-input
          v-model="email"
          type="email"
          autocomplete="email"
          label="Email"
          class="full-width q-mb-md"
        />
        <v-input
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          autocomplete="current-password"
          label="Password"
          :rules="[(val: string) => !!val || 'Password is required.']"
          class="full-width q-mb-sm"
        >
        </v-input>

        <v-alert-banner
          v-if="signInTask.last?.isError"
          design="negative"
          class="q-mb-md"
          >{{ signInTask.last?.error.message }}</v-alert-banner
        >
        <v-btn
          design="alpha"
          type="submit"
          :loading="signInTask.last?.isRunning"
          class="full-width q-mb-sm"
          label="Log in"
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VBtn from './VBtn.vue';
import VAlertBanner from './VAlertBanner.vue';
import VInput from './VInput.vue';
import { useSignInWithEmailAndPasswordTask } from 'src/composables/auth';

const email = ref<string>();
const password = ref<string>();
const isPwd = ref(true);

const signInTask = useSignInWithEmailAndPasswordTask();

const handleSubmit = () => {
  if (email.value && password.value) {
    void signInTask.perform(email.value, password.value);
  }
};
</script>
