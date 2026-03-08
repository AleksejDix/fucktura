<template>
  <div class="box flex flex-col justify-center pl-[12mm]">
    <div class="p-2">
      <p class="pb-1"><span class="inline-block mr-1 h-2 w-2 rounded bg-secondary"></span>{{ $t('Canton') }}</p>
      <p class="text-sm">{{ title }}</p>
      <p v-if="average" class="text-lg font-bold">
        {{ average.toFixed(2) }}
      </p>
      <span v-else>N/A</span>
    </div>
    <div class="p-2">
      <p class="pb-1"><span class="inline-block mr-1 h-2 w-2 rounded bg-secondary"></span>{{ $t('Canton') }}</p>
      <p class="text-sm">
        Q{{ compareQuarter }}`{{ yearMax }} vs Q{{ compareQuarter }}`{{ lastYearMax }}
      </p>
      <p
        class="text-lg font-bold"
        v-if="change !== null"
        :class="[change >= 0 ? 'text-green-700' : 'text-red-700']"
      >
        {{ change >= 0 ? '+' : '' }}
        {{ change.toFixed(2) }} %
      </p>
      <span v-else>N/A</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, default: 'Title' },
  average: { type: Number, default: 0, required: false },
  compareQuarter: {
    type: Number as PropType<number | undefined>,
    default: 0,
    required: false,
  },
  yearMax: { type: Number as PropType<number | undefined>, default: 0, required: false },
  change: { type: Number as PropType<number | null>, default: 0 },
});

const lastYearMax = computed(() => (props.yearMax !== undefined ? props.yearMax - 1 : ''));
</script>
