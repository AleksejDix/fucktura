import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Agent {
  email?: string;
  name?: string;
  phone?: string;
  avatar?: string;
}

export const useAgentStore = defineStore('agent', () => {
  const data = ref<Agent>({});

  function create(payload: Agent) {
    data.value = payload;
  }

  function update(payload: Agent) {
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
