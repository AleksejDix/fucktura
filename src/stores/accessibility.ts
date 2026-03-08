import type { PoiInDistance } from '@/api/dossiers';
import { computed } from 'vue';
import { useGlobalStore } from './global';

export function useAccessibilityData() {
  const global = useGlobalStore();

  const location = computed(() => global.data?.property.coordinates);

  function getNumberOfPoisOfType(pois: PoiInDistance[] | null | undefined, type: string) {
    return (pois || []).filter((poi) =>
      poi.categories.some((category) => category.parentCategory.nameEn === type),
    ).length;
  }

  function gatherPois(pois: PoiInDistance[] = []) {
    return [
      {
        category: 'Number of schools',
        value: getNumberOfPoisOfType(pois, 'Education'),
      },
      {
        category: 'Number of connections',
        value: getNumberOfPoisOfType(pois, 'Transport'),
      },
      {
        category: 'Number of shopping',
        value: getNumberOfPoisOfType(pois, 'Services'),
      },
    ];
  }

  const walkArea = computed(() => null);
  const walkPois = computed(() => gatherPois(global.data?.distances.walk.pois));

  const bikeArea = computed(() => null);
  const bikePois = computed(() => gatherPois(global.data?.distances.bike.pois));

  const carArea = computed(() => null);
  const carPois = computed(() => gatherPois(global.data?.distances.car.pois));

  const transportationArea = computed(() => null);
  const transportationPois = computed(() => gatherPois(global.data?.distances.transportation.pois));

  return {
    walkArea,
    walkPois,
    bikeArea,
    bikePois,
    carArea,
    carPois,
    transportationArea,
    transportationPois,
    location,
  };
}
