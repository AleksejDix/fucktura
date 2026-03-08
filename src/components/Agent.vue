<template>
  <div class="flex items-center gap-4">
    <div
      v-if="agentStore.data.avatar"
      class="border-2 border-blue-800 rounded-full aspect-square w-[15mm] relative"
    >
      <img
        class="absolute rounded-full inset-0 object-cover w-full h-full"
        :src="agentStore.data?.avatar"
        alt="Main"
        notranslate
      />
      <div class="absolute rounded-full inset-0 shadow-inner"></div>
    </div>
    <div>
      <div
        contenteditable="false"
        class="font-semibold text-black"
        data-testid="contact-person-text"
      >
        Your contact person
      </div>
      <div
        contenteditable="false"
        v-if="agentStore.data.name"
        @input="agentStore.data.name = ($event.target as HTMLElement).textContent || ''"
        notranslate
        data-testid="agent-name-text"
      >
        {{ agentStore.data.name }}
      </div>
      <div
        contenteditable="false"
        v-if="agentStore.data.phone"
        @input="agentStore.data.phone = ($event.target as HTMLElement).textContent || ''"
        notranslate
      >
        <a :href="`tel:${agentStore.data.phone}`" data-testid="agent-phone-text">
          {{ agentStore.data.phone }}
        </a>
      </div>
      <div
        contenteditable="false"
        v-if="agentStore.data.email"
        @input="agentStore.data.email = ($event.target as HTMLElement).textContent || ''"
        notranslate
      >
        <a :href="`mailto:${agentStore.data.email}`" data-testid="agent-email-text">
          {{ agentStore.data.email }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAgentStore } from '@/stores/agent';

const agentStore = useAgentStore();
</script>
