<template>
  <article>
    <header v-if="title" class="text-primary font-semibold mb-[2.5mm] flex gap-2">
      <div v-if="$slots.suffix">
        <slot name="suffix" />
      </div>
      <h3 class="text-xs">
        {{ title }}
      </h3>
    </header>
    <ul class="text-xs">
      <li
        v-for="(item, index) in filteredList"
        :key="index"
        class="flex justify-between border-b border-b-gray-400 py-[2.5mm] pr-[2.5mm]"
      >
        <slot
          v-for="(itemKey, j) in Object.keys(item)"
          :name="`list-${itemKey}`"
          :item="item"
          :key="j"
          v-bind="item"
        >
          <span v-if="j === 0" class="font-semibold">
            {{ item[itemKey] }}
            <i v-if="item['categoryIcon']" :class="`fa-regular ${item['categoryIcon']}`" />
          </span>
          <span v-else-if="itemKey !== 'categoryIcon'" class="text-gray-500" notranslate>
            {{ item[itemKey] }}
          </span>
        </slot>
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
export interface ListItem {
  [key: string]: any;
  value: unknown;
}

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  list: {
    type: Array as PropType<ListItem[]>,
    default: () => [],
  },
});

const filteredList = computed(() => props.list.filter((item) => item.value));
</script>
