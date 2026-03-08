import type { Data } from '@/api/dossiers';
import { mockData } from '@/mock/data';
import { defineStore } from 'pinia';
import { computed, nextTick, ref } from 'vue';
import { useAgencyStore } from './agency';
import { useAgentStore } from './agent';
import { useModeStore } from './mode';
import { usePriceStore } from './price';
import { useRatingStore } from './rating';

export const useGlobalStore = defineStore('data', () => {
  const data = ref<Data>(mockData);
  const loading = ref(false);
  const loaded = computed(() => data.value !== null);

  const agentStore = useAgentStore();
  const agencyStore = useAgencyStore();
  const ratingStore = useRatingStore();
  const priceStore = usePriceStore();
  const modeStore = useModeStore();

  function updateDependentStores() {
    agentStore.create({
      ...data.value?.employee,
      avatar: data.value?.images.avatar,
    });

    agencyStore.create({
      ...data.value?.agency,
      logo: data.value?.images.agencyLogo,
    });

    ratingStore.create({
      view: data.value?.neighborhood.view.rating,
      services: data.value?.neighborhood.services.rating,
      connectivity: data.value?.neighborhood.connectivity.rating,
      education: data.value?.neighborhood.education.rating,
      immissions: data.value?.neighborhood.immissions.rating,
      sunExposure: data.value?.neighborhood.sunExposure.rating,
      noise: data.value?.neighborhood.noise.rating,
      leisure: data.value?.neighborhood.leisure.rating,
    });

    priceStore.create(data.value?.price);

    nextTick(() => modeStore.updateListOfEditableElements());
  }

  // Initialize dependent stores immediately
  updateDependentStores();

  return {
    data,
    loading,
    loaded,
  };
});
