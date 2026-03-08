<template>
  <div class="flex items-center print:hidden z-10">
    <input
      :id="'d-checkbox' + id"
      type="checkbox"
      class="accent-primary bg-gray-100 border-gray-300 focus:ring-primary"
      :class="{ hidden: customIcons, ...[`h-${size}`, `w-${size}`] }"
      :checked="modelValue"
      @change="handleChange"
    />
    <label
      v-if="customIcons"
      :for="'d-checkbox' + id"
      class="bg-gray-100 border-gray-300 rounded-sm flex items-center justify-center text-base"
      :class="[
        `h-${size}`,
        `w-${size}`,
        modelValue ? 'bg-primary text-white' : 'bg-white border-2 border-gray-500 text-gray-500',
      ]"
    >
      <component :is="modelValue ? customIcons.on : customIcons.off" :size="16" />
    </label>
    <label v-else for="d-checkbox" class="ml-2 text-sm font-medium text-gray-900">{{
      label
    }}</label>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

const emit = defineEmits(['update:modelValue']);

defineProps({
  id: {
    type: String,
    default: '0',
  },
  label: {
    type: String,
    default: '',
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
  size: {
    type: Number,
    default: 8,
  },
  customIcons: {
    type: Object as PropType<Record<'on' | 'off', Component>>,
    default: () => null,
  },
});

function handleChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).checked);
}
</script>
