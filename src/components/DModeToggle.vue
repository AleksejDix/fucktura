<template>
  <div class="flex items-center text-[11px] rounded overflow-hidden border border-gray-300 select-none">
    <button
      type="button"
      @click="mode.mode = 'read'"
      class="px-2 py-0.5 transition-colors"
      :class="mode.isReadMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'"
    >
      {{ $t('View') }}
    </button>
    <button
      type="button"
      @click="mode.mode = 'edit'"
      class="px-2 py-0.5 transition-colors border-l border-gray-300"
      :class="mode.isEditMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'"
    >
      {{ $t('Edit') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useModeStore } from '@/stores/mode';

const mode = useModeStore();
</script>
