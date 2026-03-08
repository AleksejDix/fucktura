<template>
  <span notranslate class="inline-flex items-center space-x-2">
    <div class="inline-flex">
      <div class="text-primary flex">
        <template v-for="n in 5" :key="n">
          <svg
            v-if="roundedRating >= n"
            class="svg-inline--fa fa-star"
            aria-hidden="true"
            focusable="false"
            data-prefix="fas"
            data-icon="star"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            data-fa-i2svg=""
          >
            <path
              fill="currentColor"
              d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
            ></path>
          </svg>

          <svg
            v-else-if="roundedRating >= n || n - 1 >= roundedRating"
            class="svg-inline--fa fa-star"
            aria-hidden="true"
            focusable="false"
            data-prefix="fad"
            data-icon="star"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            data-fa-i2svg=""
          >
            <g class="fa-duotone-group">
              <path
                class="fa-secondary"
                fill="currentColor"
                d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"
              ></path>
              <path class="fa-primary" fill="currentColor" d=""></path>
            </g>
          </svg>

          <svg
            v-else
            class="svg-inline--fa fa-star-half"
            aria-hidden="true"
            focusable="false"
            data-prefix="fad"
            data-icon="star-half"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            data-fa-i2svg=""
          >
            <g class="fa-duotone-group">
              <path
                class="fa-secondary"
                fill="currentColor"
                d="M146.3 512C145.3 512.1 144.2 512.1 143.1 512H146.3zM288 439.8V-.0387L288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.1 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L288 439.8z"
              ></path>
              <path
                class="fa-primary"
                fill="currentColor"
                d="M288 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.995 275.8 .0131 287.1-.0391L288 439.8zM433.2 512C432.1 512.1 431 512.1 429.9 512H433.2z"
              ></path>
            </g>
          </svg>
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
          <i class="fa-solid fa-minus"></i>
        </button>
        <button
          class="text-gray-800 px-1 font-semibold leading-snug text-xs"
          type="button"
          @click="handleKeyUp"
        >
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    </div>
  </span>
</template>

<script setup lang="ts">
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
