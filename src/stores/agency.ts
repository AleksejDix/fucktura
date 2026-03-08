import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Agency {
  addressLine1?: string;
  addressLine2?: string;
  name?: string;
  phone?: string;
  email?: string;
  logo?: string;
}

export const useAgencyStore = defineStore('agency', () => {
  const data = ref<Agency>({});

  function create(payload: Agency) {
    data.value = payload;
  }

  function update(payload: Agency) {
    data.value = {
      ...data.value,
      ...payload,
    };
  }

  return {
    data,
    create,
    update,
  };
});
