<template>
  <div
    class="grid gap-[1px] p-[1px] bg-black/5 rounded-[1px]"
    :class="active ? 'opacity-100' : 'opacity-40'"
    style="grid-template-columns: repeat(4, 2px); grid-template-rows: repeat(4, 2px)"
    :title="active ? 'Saving…' : 'Saved'"
  >
    <span
      v-for="(on, i) in cells"
      :key="i"
      class="w-[2px] h-[2px] transition-colors"
      :class="on ? 'bg-emerald-500' : 'bg-gray-300'"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { saveEvents } from '@/fs/repo';

// 4x4 spiral order (clockwise from top-left), indexed into a row-major 4x4 grid.
const SPIRAL = [0, 1, 2, 3, 7, 11, 15, 14, 13, 12, 8, 4, 5, 6, 10, 9];
const STEP_MS = 28;
const HOLD_MS = 80;

const cells = ref<boolean[]>(new Array(16).fill(false));
const active = ref(false);
let token = 0;

async function play() {
  const myToken = ++token;
  active.value = true;
  // Fill stage: light pixels one by one along the spiral.
  for (let i = 0; i < SPIRAL.length; i++) {
    if (token !== myToken) return;
    cells.value[SPIRAL[i]] = true;
    cells.value = [...cells.value];
    await wait(STEP_MS);
  }
  // Full-on flash hold.
  await wait(HOLD_MS);
  if (token !== myToken) return;
  // Clear stage: turn off in the same order.
  for (let i = 0; i < SPIRAL.length; i++) {
    if (token !== myToken) return;
    cells.value[SPIRAL[i]] = false;
    cells.value = [...cells.value];
    await wait(STEP_MS / 2);
  }
  if (token === myToken) active.value = false;
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function onSaveStart() {
  play();
}

onMounted(() => saveEvents.addEventListener('save-start', onSaveStart));
onUnmounted(() => saveEvents.removeEventListener('save-start', onSaveStart));
</script>
