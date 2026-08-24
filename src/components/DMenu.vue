<template>
  <div class="relative" @mouseenter="emit('hover')">
    <button
      @click="emit('toggle')"
      class="h-full px-4 flex items-center transition-colors"
      :class="[
        menu.brand ? 'w-[11rem] border-r border-gray-200' : '',
        menu.bold ? 'font-bold' : '',
        open ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100',
      ]"
    >
      <DLogo v-if="menu.brand" />
      <template v-else>{{ menu.label }}</template>
    </button>

    <div
      v-if="open"
      class="absolute top-full left-0 min-w-[220px] bg-white shadow-xl border border-gray-200 py-1 z-50"
    >
      <template v-for="(item, i) in menu.items" :key="i">
        <div v-if="item.separator" class="border-t border-gray-200 my-1" />
        <button
          v-else-if="!item.hidden"
          @click.stop="emit('run', item)"
          :disabled="item.disabled"
          class="w-full flex items-center justify-between px-3 py-1.5 text-left text-[13px] transition-colors"
          :class="[
            item.disabled
              ? 'text-gray-300 cursor-default'
              : item.destructive
                ? 'text-red-500 hover:bg-gray-100'
                : 'text-gray-800 hover:bg-black hover:text-white',
            item.strikethrough ? 'line-through decoration-gray-400' : '',
          ]"
        >
          <span class="flex items-center gap-2">
            <span class="w-4 text-center">{{ item.checked ? '✓' : '' }}</span>
            {{ item.label }}
          </span>
          <span
            v-if="item.shortcut"
            class="text-[11px] ml-4"
            :class="item.disabled ? 'text-gray-300' : 'text-gray-400'"
            >{{ item.shortcut }}</span
          >
        </button>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
export interface MenuItem {
  label?: string;
  shortcut?: string;
  action?: () => void | Promise<void>;
  disabled?: boolean;
  hidden?: boolean;
  destructive?: boolean;
  separator?: boolean;
  checked?: boolean;
  strikethrough?: boolean;
}

export interface Menu {
  label: string;
  bold?: boolean;
  /** Brand entry: fixed width, right border, logo instead of the label. */
  brand?: boolean;
  items: MenuItem[];
}
</script>

<script setup lang="ts">
import DLogo from './DLogo.vue';

defineProps<{ menu: Menu; open: boolean }>();
const emit = defineEmits<{ toggle: []; hover: []; run: [MenuItem] }>();
</script>
