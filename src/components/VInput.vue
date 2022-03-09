<template>
  <q-input
    ref="templateRef"
    v-model="modelValue"
    dense
    outlined
    hide-bottom-space
  >
    <template v-for="(_, slot) in $slots" #[slot]>
      <slot :name="slot"></slot>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue';
import { QInput } from 'quasar';

const modelValue = ref();

// All props and emits/events are automatically inherited.
// You do not need to define them all here.
// Read more: https://v3.vuejs.org/guide/component-attrs.html#attribute-inheritance)

//Methods
const templateRef = ref() as Ref<QInput>;
const resetValidation = () => {
  templateRef.value.resetValidation();
};
const validate = (value?: unknown) => {
  return templateRef.value.validate(value);
};
const focus = () => {
  templateRef.value.focus();
};
const blur = () => {
  templateRef.value.blur();
};
const select = () => {
  templateRef.value.select();
};
const getNativeElement = (): unknown => {
  return templateRef.value.getNativeElement();
};
defineExpose({
  resetValidation,
  validate,
  focus,
  blur,
  select,
  getNativeElement,
});
</script>

<style></style>
