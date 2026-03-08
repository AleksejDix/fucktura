<template>
  <div
    tabindex="0"
    v-bind="$attrs"
    :class="{ 'outline-dotted outline-emerald-400': modeStore.isEditMode }"
    @click="focusNumberField"
    @focus="focusNumberField"
    notranslate
  >
    <input
      v-if="isFocused"
      ref="numberField"
      type="number"
      class="focus:outline-0"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement | null)?.value)"
      @blur="isFocused = false"
    />
    <slot v-else name="readOnlyContent" />
  </div>
</template>
<script setup lang="ts">
import { useModeStore } from '@/stores/mode';

const modeStore = useModeStore();

defineEmits(['update:modelValue']);
defineProps({
  modelValue: {
    type: [String, Number],
    default: 0,
  },
});

const isFocused = ref(false);
const numberField = ref();

const focusNumberField = () => {
  if (!modeStore.isEditMode) return;
  isFocused.value = true;
  nextTick(() => numberField.value.focus());
};
</script>
