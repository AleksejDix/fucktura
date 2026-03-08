<template>
  <PageTemplate :page-index="pageIndex">
    <section class="grid gap-8">
      <header>
        <h2 contenteditable="false">{{ $t('Location') }}</h2>
        <p contenteditable="false">
          Surroundings of the property: The factors influencing the property's value are rated on a
          scale from 1 to 5.
        </p>
      </header>
      <div class="grid gap-4">
        <div>
          <image-with-placeholder
            class="w-full object-cover max-h-[78.58125mm] h-[78.58125mm]"
            :src="global.data?.property.imageSrcOverall"
            alt=""
          />
        </div>
        <microlocation-legends />
        <div class="pt-[1cm]">
          <RatingOverview :ratings="global.data?.neighborhood" />
        </div>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/stores/global';
import MicrolocationLegends from '../MicrolocationLegends.vue';
import PageTemplate from '../PageTemplate.vue';
import RatingOverview from '../RatingOverview.vue';

defineProps({ pageIndex: { type: Number, default: 0 } });

const global = useGlobalStore();
</script>
