<template>
  <div
    class="flex items-center gap-3 cursor-default select-none"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    :title="'Fucktura'"
  >
    <div
      class="grid shrink-0"
      :style="iconStyle"
    >
      <span
        v-for="(on, i) in iconCells"
        :key="i"
        class="transition-colors"
        :style="cellStyle"
        :class="on ? 'bg-gray-900' : 'bg-gray-200'"
      />
    </div>
    <div class="grid shrink-0" :style="wordStyle">
      <span
        v-for="(on, i) in wordCells"
        :key="i"
        :style="cellStyle"
        :class="on ? 'bg-gray-900' : 'bg-transparent'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';

// ---- icon ----
const IDLE = Array(25).fill(true);

const SQUID = [
  false, false, true,  false, false,
  false, true,  true,  true,  false,
  true,  true,  true,  true,  true,
  true,  false, true,  false, true,
  false, true,  false, true,  false,
];
const CRAB = [
  true,  false, true,  false, true,
  true,  true,  true,  true,  true,
  true,  true,  false, true,  true,
  true,  true,  true,  true,  true,
  false, true,  false, true,  false,
];
const OCTOPUS = [
  true,  true,  true,  true,  true,
  true,  false, true,  false, true,
  true,  true,  true,  true,  true,
  false, true,  true,  true,  false,
  true,  false, false, false, true,
];
const CLASSICS = [SQUID, CRAB, OCTOPUS];

function randomCreature(): boolean[] {
  const cells = new Array(25).fill(false);
  for (let r = 0; r < 5; r++) {
    const rowWeight = r === 0 || r === 4 ? 0.45 : 0.85;
    for (let c = 0; c < 3; c++) {
      const colWeight = c === 2 ? 1.0 : c === 1 ? 0.8 : 0.6;
      const on = Math.random() < rowWeight * colWeight;
      cells[r * 5 + c] = on;
      if (c < 2) cells[r * 5 + (4 - c)] = on;
    }
  }
  return cells;
}

function noise(): boolean[] {
  return Array.from({ length: 25 }, () => Math.random() > 0.5);
}

const iconCells = ref<boolean[]>([...IDLE]);
let token = 0;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function loop() {
  const myToken = ++token;
  while (token === myToken) {
    iconCells.value = noise();
    await sleep(40);
    if (token !== myToken) return;
    iconCells.value = Math.random() < 0.25
      ? CLASSICS[Math.floor(Math.random() * CLASSICS.length)]
      : randomCreature();
    await sleep(220);
  }
}

function onEnter() { loop(); }
function onLeave() { token++; iconCells.value = [...IDLE]; }

onUnmounted(() => { token++; });

// ---- wordmark ----
// Each letter is 5 cols wide × 5 rows tall; 1 gap col between letters.
type LetterGrid = [string, string, string, string, string];
const LETTERS: Record<string, LetterGrid> = {
  F: ['#####', '#....', '####.', '#....', '#....'],
  U: ['#...#', '#...#', '#...#', '#...#', '.###.'],
  C: ['.####', '#....', '#....', '#....', '.####'],
  K: ['#...#', '#..#.', '###..', '#..#.', '#...#'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  R: ['####.', '#...#', '####.', '#..#.', '#...#'],
  A: ['.###.', '#...#', '#####', '#...#', '#...#'],
};

const WORD = 'FUCKTURA';
const LETTER_W = 5;
const GAP = 1;
const WORD_COLS = WORD.length * LETTER_W + (WORD.length - 1) * GAP;

const wordCells = computed<boolean[]>(() => {
  const grid: boolean[] = new Array(WORD_COLS * 5).fill(false);
  for (let i = 0; i < WORD.length; i++) {
    const letter = LETTERS[WORD[i]];
    const xOffset = i * (LETTER_W + GAP);
    for (let r = 0; r < 5; r++) {
      const row = letter[r];
      for (let c = 0; c < LETTER_W; c++) {
        grid[r * WORD_COLS + xOffset + c] = row[c] === '#';
      }
    }
  }
  return grid;
});

const PX = 2;
const cellStyle = { width: `${PX}px`, height: `${PX}px` };
const iconStyle = {
  gridTemplateColumns: `repeat(5, ${PX}px)`,
  gridTemplateRows: `repeat(5, ${PX}px)`,
};
const wordStyle = computed(() => ({
  gridTemplateColumns: `repeat(${WORD_COLS}, ${PX}px)`,
  gridTemplateRows: `repeat(5, ${PX}px)`,
}));
</script>
