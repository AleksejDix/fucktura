<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/30"
      @click.self="emit('close')"
    >
      <div class="bg-white w-[300px] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] text-center">
        <p class="text-[18pt] font-bold">Fucktura</p>
        <p class="text-[9pt] text-gray-500 mt-1">v1.0.0</p>
        <p class="text-[9pt] text-gray-600 mt-4">{{ t('About description') }}</p>
        <p class="text-[8pt] text-gray-400 mt-4">Made by Aleksej Dix</p>
        <button
          @click="emit('close')"
          class="mt-4 px-4 py-1.5 text-[9pt] bg-black text-white hover:bg-gray-800"
        >
          OK
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();
const { t } = useI18n();
</script>
