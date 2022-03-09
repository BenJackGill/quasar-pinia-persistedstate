<template>
  <auth-login />
  <q-page class="column items-center">
    <div v-if="getFirstNameTask.last?.isError">
      {{ getFirstNameTask.last?.error.message }}
    </div>
    <div v-if="getFirstNameTask.last?.isRunning">Loading...</div>
    <div v-else><strong>firstName:</strong> {{ firstName }}</div>
    <q-form @submit="handleSubmit">
      <p>Change First Name</p>
      <q-input v-model="firstNameInputValue" filled outline />
      <q-btn label="Submit Name Change to Firebase" type="submit" />
    </q-form>
    <q-btn label="Update Name on Screeen" @click="handleUpdate" />
    <q-btn label="Console Log Name Details" @click="handleConsoleLog" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from 'src/store/user';
import AuthLogin from '../components/AuthLogin.vue';
const userStore = useUserStore();
const setFirstNameTask = userStore.setFirstName();
const getFirstNameTask = userStore.getFirstName();
const firstName = ref<string>();
onMounted(async () => {
  firstName.value = await getFirstNameTask.perform();
});
const firstNameInputValue = ref<string>();
const handleSubmit = async () => {
  if (firstNameInputValue.value) {
    await setFirstNameTask.perform(firstNameInputValue.value);
  }
};
const handleUpdate = () => {
  firstName.value = userStore.user.firstName;
};
const handleConsoleLog = async () => {
  console.log('firstName returned from Pinia store:', userStore.user.firstName);
  const getFirstNameValue = await getFirstNameTask.perform();
  console.log('firstName returned from getFirstName:', getFirstNameValue);
};
</script>
