<template>
  <template v-if="error">
    <div class="max-w-md mx-auto mt-12 p-6 border border-red-200 bg-red-50 text-[9pt] space-y-3">
      <p class="text-[11pt] font-bold text-red-700">{{ $t('Something went wrong') }}</p>
      <p class="text-gray-700">{{ error.message }}</p>
      <div class="flex gap-2">
        <button
          @click="retry"
          class="px-3 py-1.5 bg-black text-white hover:bg-gray-800 transition-colors"
        >
          {{ $t('Retry') }}
        </button>
        <button
          @click="goHome"
          class="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {{ $t('All documents') }}
        </button>
      </div>
      <details v-if="error.stack" class="text-gray-400 text-[8pt]">
        <summary class="cursor-pointer">{{ $t('Details') }}</summary>
        <pre class="whitespace-pre-wrap mt-2">{{ error.stack }}</pre>
      </details>
    </div>
  </template>
  <template v-else>
    <slot />
  </template>
</template>

<script setup lang="ts">
import { onErrorCaptured, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const error = ref<Error | null>(null);
const route = useRoute();
const router = useRouter();

onErrorCaptured((e) => {
  error.value = e instanceof Error ? e : new Error(String(e));
  console.error('[DErrorBoundary] caught', e);
  return false;
});

watch(
  () => route.fullPath,
  () => {
    error.value = null;
  },
);

function retry() {
  error.value = null;
}

function goHome() {
  router.push('/');
  error.value = null;
}
</script>
