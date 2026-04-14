<template>
  <component
    :is="tag"
    :contenteditable="isEdit"
    :class="[
      isEdit ? 'outline-none border-b border-dashed border-gray-300 focus:border-gray-900' : '',
      $attrs.class,
    ]"
    @blur="onBlur"
    @keydown.enter.prevent="($event.target as HTMLElement).blur()"
    v-text="modelValue"
  />
</template>

<script setup lang="ts">
import { useModeStore } from '@/stores/mode';
import { computed } from 'vue';

const modeStore = useModeStore();
const isEdit = computed(() => modeStore.isEditMode);

const props = defineProps<{
  modelValue: string | number;
  tag?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

function onBlur(e: Event) {
  const text = (e.target as HTMLElement).textContent?.trim() ?? '';
  if (text !== String(props.modelValue)) {
    emit('update:modelValue', text);
  }
}
</script>
