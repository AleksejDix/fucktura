<template>
  <div class="p-4">
    <div class="grid grid-cols-3 grid-rows-2 gap-y-4">
      <div class="box col-span-1 h-4 w-12 outline-dotted outline-[#34d399]"></div>
      <div class="flex items-center col-span-2">
        <p>{{ $t('Editable content') }}</p>
      </div>
      <span class="text-base col-span-1 flex items-center gap-1">
        <Eye :size="16" />
        /
        <EyeOff :size="16" />
      </span>
      <div class="flex items-center col-span-2">
        <p>Show/Hide page in print</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next';
</script>
