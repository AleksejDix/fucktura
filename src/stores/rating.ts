import { roundToStep } from '@/functions/roundToStep';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { reactivePick } from '@vueuse/core';

export interface Rating {
  view?: number;
  connectivity?: number;
  education?: number;
  noise?: number;
  immissions?: number;
  sunExposure?: number;
  leisure?: number;
  services?: number;
}

export const useRatingStore = defineStore('rating', () => {
  const rating = ref<Rating>({
    view: 0,
    connectivity: 0,
    noise: 0,
    immissions: 0,
    sunExposure: 0,
    leisure: 0,
    services: 0,
    education: 0,
  });

  function create(payload: Rating) {
    rating.value = {
      ...rating.value,
      ...payload,
    };
  }

  const overall = computed(() => {
    const ratingFactors = Object.values(
      reactivePick(rating.value, 'view', 'connectivity', 'education', 'noise', 'services'),
    );
    return roundToStep(ratingFactors.reduce((x, sum) => sum + x, 0) / ratingFactors.length, 0.5);
  });

  return {
    rating,
    overall,
    create,
  };
});
