<template>
  <th :class="[isNumber ? 'text-right' : 'text-left']">
    <slot :text="text">Header</slot>
  </th>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { isObject } from '@vueuse/core';

export interface Column {
  text: string;
  type?: 'number' | 'string';
}

const props = defineProps({
  value: {
    type: [Object, String] as PropType<Column | string>,
    required: true,
  },
});

const text = computed(() => (isObject(props.value) ? reactive(props.value).text : props.value));

const isNumber = computed(() => {
  if (typeof props.value === 'string') return false;
  if (isObject(props.value)) {
    return 'type' in props.value && props.value.type === 'number';
  } else {
    return false;
  }
});
</script>
