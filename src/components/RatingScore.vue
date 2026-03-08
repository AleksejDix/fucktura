<template>
  <span notranslate class="inline-flex items-center space-x-2">
    <div class="inline-flex">
      <div class="text-primary flex">
        <template v-for="n in 5" :key="n">
          <Star v-if="roundedRating >= n" :size="16" fill="currentColor" :stroke-width="0" />
          <StarHalf v-else-if="roundedRating >= n - 0.5" :size="16" fill="currentColor" :stroke-width="1" />
          <Star v-else :size="16" :stroke-width="1" />
        </template>
      </div>
    </div>

    <span
      class="min-w-[1.5em] text-right"
      @input="onChange"
      @keydown.down="handleKeyDown"
      @keydown.up="handleKeyUp"
      >{{ roundedRating.toFixed(1) }}</span
    >
    <div contenteditable="false" class="rating sr-only"></div>
    <div v-if="editable" class="rating-controls print:hidden">
      <div class="flex flex-nowrap items-center border rounded divide-x">
        <button
          class="text-gray-800 px-1 font-semibold leading-snug text-xs"
          type="button"
          @click="handleKeyDown"
        >
          <Minus :size="12" />
        </button>
        <button
          class="text-gray-800 px-1 font-semibold leading-snug text-xs"
          type="button"
          @click="handleKeyUp"
        >
          <Plus :size="12" />
        </button>
      </div>
    </div>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Minus, Plus, Star, StarHalf } from 'lucide-vue-next';
import { roundToStep } from '@/functions/roundToStep';

const props = defineProps({
  rating: {
    type: Number,
    required: true,
  },
  editable: {
    type: Boolean,
    default: true,
  }
});

const emit = defineEmits(['update:rating']);

const roundedRating = computed(() => roundToStep(props.rating, 0.5));

const onChange = (event: Event) => {
  emit('update:rating', Number((event.target as HTMLElement).textContent) || 0);
};

const handleKeyDown = () => {
  if (roundedRating.value === 0) return;
  emit('update:rating', roundedRating.value - 0.5);
};

const handleKeyUp = () => {
  if (roundedRating.value === 5) return;

  emit('update:rating', roundedRating.value + 0.5);
};
</script>

<style scoped>
.rating[contenteditable] ~ .rating-controls,
.rating[contenteditable='false'] ~ .rating-controls {
  display: none;
}

@media not print {
  .rating[contenteditable='true'] ~ .rating-controls {
    display: block;
  }
}
</style>
