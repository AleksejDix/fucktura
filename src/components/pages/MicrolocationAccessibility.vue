<template>
  <PageTemplate :page-index="pageIndex">
    <section class="grid gap-y-8">
      <header>
        <h2 contenteditable="false">Accessibility in 15 min</h2>
        <p contenteditable="false">Interesting places that can be reached within 15 minutes.</p>
      </header>
      <div>
        <div class="grid overflow-hidden grid-cols-2 grid-rows-2 gap-6">
          <div class="box">
            <div class="box h-60 mb-4">
              <img src="https://placehold.co/330x240?text=Walk+Map" class="w-full h-full object-cover" />
            </div>
            <div class="box flex items-center">
              <DList class="w-full" :title="$t('On foot')" :list="walkPois" />
            </div>
          </div>
          <div class="box">
            <div class="box h-60 mb-4">
              <img src="https://placehold.co/330x240?text=Bike+Map" class="w-full h-full object-cover" />
            </div>
            <div class="box flex items-center">
              <DList class="w-full" :title="$t('By bicycle')" :list="bikePois" />
            </div>
          </div>
          <div class="box">
            <div class="box h-60 mb-4">
              <img src="https://placehold.co/330x240?text=Car+Map" class="w-full h-full object-cover" />
            </div>
            <div class="box flex items-center">
              <DList class="w-full" :title="$t('By car')" :list="carPois" />
            </div>
          </div>
          <div class="box">
            <div class="box h-60 mb-4">
              <img src="https://placehold.co/330x240?text=Transit+Map" class="w-full h-full object-cover" />
            </div>
            <div class="box flex items-center">
              <DList class="w-full" :title="$t('With public transport')" :list="transportationPois" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { useAccessibilityData } from '@/stores/accessibility';
import DList from '../DList.vue';
import PageTemplate from '../PageTemplate.vue';

defineProps({ pageIndex: { type: Number, default: 0 } });

const { walkPois, bikePois, carPois, transportationPois } = useAccessibilityData();
</script>
