<template>
  <q-banner dense rounded :class="classValue" class="full-width">
    <template #avatar>
      <q-icon :name="iconNameValue" size="sm" />
    </template>
    <slot></slot>
  </q-banner>
</template>

<script setup lang="ts">
import { PropType, toRefs, computed } from 'vue';
import {
  ionWarningOutline,
  ionCheckmarkCircleOutline,
  ionInformationCircleOutline,
  ionAlertCircleOutline,
} from '@quasar/extras/ionicons-v6';

type Design = 'negative' | 'positive' | 'info' | 'warning';
const props = defineProps({
  design: {
    type: String as PropType<Design>,
    required: true,
    default: 'negative',
  },
});
const { design } = toRefs(props);

const classValue = computed(() => {
  if (design.value == 'negative') {
    return 'bg-negative text-white';
  } else if (design.value == 'positive') {
    return 'bg-positive text-dark';
  } else if (design.value == 'info') {
    return 'bg-info text-dark';
  } else if (design.value == 'warning') {
    return 'bg-warning text-dark';
  } else {
    return 'bg-grey-3 text-dark';
  }
});

const iconNameValue = computed(() => {
  if (design.value == 'negative') {
    return ionWarningOutline;
  } else if (design.value == 'positive') {
    return ionCheckmarkCircleOutline;
  } else if (design.value == 'info') {
    return ionInformationCircleOutline;
  } else if (design.value == 'warning') {
    return ionAlertCircleOutline;
  } else {
    return ionAlertCircleOutline;
  }
});
</script>
