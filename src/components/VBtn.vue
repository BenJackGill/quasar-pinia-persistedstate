<template>
  <q-btn
    ref="templateRef"
    :flat="flatValue"
    dense
    no-caps
    unelevated
    :color="colorValue"
    :text-color="textColorValue"
    class="q-py-sm q-px-md"
  >
    <template v-for="(_, slot) in $slots" #[slot]>
      <slot :name="slot"></slot>
    </template>
  </q-btn>
</template>

<script setup lang="ts">
import { ref, Ref, PropType, toRefs, computed } from 'vue';
import { QBtn } from 'quasar';

type Design = 'alpha' | 'beta' | 'gamma' | 'warning' | 'cta';
const props = defineProps({
  design: {
    type: String as PropType<Design>,
    required: true,
    default: 'beta',
  },
});
const { design } = toRefs(props);

const flatValue = computed(() => {
  if (design.value == 'gamma') {
    return true;
  } else {
    return false;
  }
});

const textColorValue = computed(() => {
  if (design.value == 'alpha') {
    return 'white';
  } else if (design.value == 'beta') {
    return 'dark';
  } else if (design.value == 'gamma') {
    return 'dark';
  } else if (design.value == 'warning') {
    return 'white';
  } else if (design.value == 'cta') {
    return 'white';
  } else {
    return 'dark';
  }
});

const colorValue = computed(() => {
  if (design.value == 'alpha') {
    return 'primary';
  } else if (design.value == 'beta') {
    return 'grey-3';
  } else if (design.value == 'gamma') {
    return 'null'; //removes the color attribute
  } else if (design.value == 'warning') {
    return 'negative';
  } else if (design.value == 'cta') {
    return 'cta';
  } else {
    return 'grey-3';
  }
});

//Methods
const templateRef = ref() as Ref<QBtn>;
const click = (evt?: Event | undefined) => {
  templateRef.value.click(evt);
};
defineExpose({
  click,
});
</script>

<style></style>
