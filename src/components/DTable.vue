<template>
  <table class="table-auto border-collapse w-full">
    <template v-if="variant === 'vertical'">
      <thead>
        <tr class="align-middle text-primary">
          <DTableHeading
            class="p-2"
            v-for="(value, key, index) in columns"
            :key="key"
            :value="value"
            :class="{
              'pl-0': index === 0,
              'pr-0': index === Object.keys(columns).length - 1,
            }"
          >
            <template #default="{ text }">
              <slot :name="`head-${key}`">
                {{ text }}
              </slot>
            </template>
          </DTableHeading>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in visibleItems"
          :key="index"
          class="rounded hover:bg-gray-200 cursor-cell border-b border-gray-400 align-middle"
        >
          <td
            v-for="(value, key, j) in columns"
            :key="key"
            class="p-2"
            :class="{
              'pl-0': j === 0,
              'pr-0': j === Object.keys(columns).length - 1,
            }"
          >
            <slot :name="`col-${key}`" v-bind="item">
              <template v-if="item[key]">
                {{ item[key] }}
              </template>
            </slot>
          </td>
        </tr>
      </tbody>
    </template>
    <template v-if="variant === 'horizontal'">
      <!-- https://www.w3.org/WAI/tutorials/tables/one-header/#table-with-header-cells-in-the-first-column-only -->
      <tr v-for="(value, key) in columns" :key="key" class="border-b border-gray-400">
        <DTableHeading :value="value" class="pl-0 py-2 pr-3">
          <template #default="{ text }">
            <slot :name="`head-${key}`">
              {{ text }}
            </slot>
          </template>
        </DTableHeading>

        <td
          v-for="(item, j) in visibleItems"
          :key="j"
          class="px-4 py-2"
          :class="{
            'pr-0': j === visibleItems.length - 1,
          }"
        >
          <slot v-if="$slots[`col-${key}`]" :name="`col-${key}`" v-bind="item">
            {{ item[key] }}
          </slot>
          <slot v-else>
            {{ item[key] }}
          </slot>
        </td>
      </tr>
    </template>
  </table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DTableHeading from '../components/DTableHeading.vue';
import type { Column } from '../components/DTableHeading.vue';

export interface Row {
  [key: string]: any;
}

export interface Columns {
  [key: string]: Column | string;
}

const props = defineProps({
  data: {
    type: Array as PropType<Row[]>,
    default: () => [],
  },
  columns: {
    type: Object as PropType<Columns>,
    required: true,
  },
  maxItems: {
    type: Number,
    default: 10,
  },
  variant: {
    type: String,
    default: 'vertical',
  },
});

const visibleItems = computed(() => props.data.slice(0, props.maxItems));
</script>
