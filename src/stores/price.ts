import type { Price, Prices } from '@/api/dossiers';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Nullable } from '@/lib/types';

export const usePriceStore = defineStore('price', () => {
  const ad = ref<Price>({
    confidence: 0,
    price: 0,
    priceM2: 0,
    priceM2Max: 0,
    priceM2Min: 0,
    priceMax: 0,
    priceMin: 0,
  });

  const transaction = ref<Nullable<Price>>(null);

  const selected = ref<Price>({} as Price);

  function create(payload?: Prices) {
    ad.value = {
      ...ad.value,
      ...payload?.ad,
    };
    if (payload?.transaction) {
      transaction.value = {
        ...transaction.value,
        ...payload.transaction,
      };
    }
    select(payload?.transaction && 'Transaction');
  }

  function select(payload: 'Transaction' | 'Advertisement' = 'Advertisement') {
    if (payload === 'Transaction' && transaction.value) selected.value = transaction.value;
    else selected.value = ad.value;
  }

  return {
    ad,
    transaction,
    selected,
    create,
    select,
  };
});
