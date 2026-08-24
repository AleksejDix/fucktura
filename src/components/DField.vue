<template>
  <div>
    <label v-if="label" class="block text-[8pt] text-gray-500 mb-0.5">{{ label }}</label>
    <input
      :value="modelValue ?? ''"
      :type="type"
      :placeholder="placeholder"
      :readonly="readonly"
      :step="step"
      :min="min"
      class="w-full py-1.5 text-[9pt] placeholder-gray-300 focus:outline-none"
      :class="[
        variant === 'underline'
          ? 'border-b border-gray-200 bg-transparent focus:border-gray-900'
          : 'border px-2 focus:border-gray-900',
        variant === 'box' && (readonly ? 'border-gray-200 bg-gray-50' : 'border-gray-300'),
        readonly ? 'text-gray-400' : 'text-gray-900',
        mono && 'font-mono',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="emit('save', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Labeled input in the app's two styles: 'underline' (settings forms)
 * and 'box' (list editors). Emits the raw string per keystroke as
 * update:modelValue and again as `save` on blur — fields that parse
 * their value bind :model-value and handle `save` alone, exactly like
 * the previous :value/@blur inputs.
 */
withDefaults(
  defineProps<{
    modelValue?: string | number;
    label?: string;
    placeholder?: string;
    type?: string;
    variant?: 'underline' | 'box';
    mono?: boolean;
    readonly?: boolean;
    align?: 'left' | 'right' | 'center';
    step?: string;
    min?: string | number;
  }>(),
  { variant: 'underline', type: 'text' },
);

const emit = defineEmits<{ 'update:modelValue': [string]; save: [string] }>();
</script>
