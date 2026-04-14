<template>
  <!-- Non-Chromium warning — blocks app -->
  <div v-if="folder.state === 'unsupported'" class="h-screen flex flex-col">
    <div class="bg-red-600 text-white px-4 py-2 text-sm font-bold">
      {{ $t('Browser not supported — please use Chrome, Edge, Brave, or another Chromium-based browser.') }}
    </div>
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="max-w-md text-center space-y-3">
        <h2 class="text-xl font-bold">{{ $t('File System Access API required') }}</h2>
        <p class="text-gray-600 text-sm">
          {{ $t('This app stores your invoices as real files on your disk. It needs the File System Access API, which is only available in Chromium-based browsers.') }}
        </p>
      </div>
    </div>
  </div>

  <!-- Needs folder pick -->
  <div v-else-if="folder.state === 'needs-pick' || folder.state === 'picking'" class="h-screen flex items-center justify-center p-8">
    <div class="max-w-md text-center space-y-4">
      <h2 class="text-2xl font-bold">{{ $t('Choose a folder') }}</h2>
      <p class="text-gray-600 text-sm">
        {{ $t('Your invoices, clients, and positions will be saved as JSON files in the folder you pick. You can open them in Finder, back them up, or sync them via iCloud or Dropbox.') }}
      </p>
      <button
        @click="folder.openFolder()"
        :disabled="folder.state === 'picking'"
        class="px-6 py-3 bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {{ folder.state === 'picking' ? $t('Loading…') : $t('Pick folder') }}
      </button>
      <p v-if="folder.error" class="text-red-600 text-sm">{{ folder.error }}</p>
    </div>
  </div>

  <!-- Loading -->
  <div v-else-if="folder.state === 'loading' || folder.state === 'init'" class="h-screen flex items-center justify-center">
    <h2>{{ $t('Loading') }}</h2>
  </div>

  <!-- Ready — render the app -->
  <slot v-else />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useFolderStore } from '@/stores/folder';

const folder = useFolderStore();
onMounted(() => folder.init());
</script>
