<template>
  <header
    class="absolute top-0 left-0 right-0 pt-[10mm] pl-[var(--norm-ml)] pr-[var(--norm-mr)] max-h-[var(--norm-header-h)]"
  >
    <div class="flex justify-end">
      <div class="text-[9pt] text-right leading-relaxed">
        <div class="font-bold">{{ sender.company }}</div>
        <div>{{ sender.street }}</div>
        <div>
          <span class="font-mono">{{ sender.zip }}</span> {{ sender.city }},
          {{ sender.country }}
        </div>
        <div>{{ sender.email }}</div>
        <div>{{ sender.website }}</div>
        <div class="text-gray-500 font-mono">{{ sender.uid }}</div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { SenderSnapshot } from '@/fs/types';

defineProps<{ sender: SenderSnapshot }>();
</script>
