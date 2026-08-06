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
  const el = e.target as HTMLElement;
  const text = el.textContent?.trim() ?? '';
  if (text !== String(props.modelValue)) {
    emit('update:modelValue', text);
    // Snap the DOM back to the store value. contenteditable text lives
    // outside Vue's vdom, so if the save fails (and modelValue never
    // changes) the screen would otherwise keep showing unsaved text as
    // saved. On success the modelValue update patches the new text in.
    el.textContent = String(props.modelValue);
  }
}
</script>
