<template>
  <div class="grid gap-8">
    <article class="grid gap-y-4">
      <header>
        <h2>
          <span class="mr-4">{{ $t('Neighborhood') }}</span>
          <RatingScore :rating="ratingStore.overall" :editable="false"></RatingScore>
        </h2>
      </header>
      <div>
        <div class="grid grid-cols-2 gap-x-8 gap-y-4">
          <div v-if="ratingStore.rating.noise !== undefined" class="box">
            <p class="font-semibold mb-1">{{ $t('Silence') }}</p>
            <RatingScore v-model:rating="ratingStore.rating.noise" />
          </div>
          <div v-if="ratingStore.rating.education !== undefined" class="box">
            <p class="font-semibold mb-1">{{ $t('Schools') }}</p>
            <RatingScore v-model:rating="ratingStore.rating.education" />
          </div>

          <div v-if="ratingStore.rating.services !== undefined" class="box">
            <p class="font-semibold mb-1">{{ $t('Shopping') }}</p>
            <RatingScore v-model:rating="ratingStore.rating.services" />
          </div>
          <div v-if="ratingStore.rating.view !== undefined" class="box">
            <p class="font-semibold mb-1">{{ $t('View') }}</p>
            <RatingScore v-model:rating="ratingStore.rating.view" />
          </div>
          <div v-if="ratingStore.rating.connectivity !== undefined" class="box">
            <p class="font-semibold mb-1">{{ $t('Connectivity') }}</p>
            <RatingScore v-model:rating="ratingStore.rating.connectivity" />
          </div>
        </div>
      </div>
    </article>

    <article class="grid gap-y-4">
      <header>
        <h2>{{ $t('Other factors') }}</h2>
        <p>{{ $t('Excluded from ranking') }}</p>
      </header>

      <div class="grid gap-12">
        <div class="grid grid-cols-2 gap-x-8 gap-y-4">
          <div v-if="ratingStore.rating.sunExposure !== undefined" class="overflow-hidden">
            <p class="font-semibold mb-1">{{ $t('Sun Exposure') }}</p>
            <RatingScore v-model:rating="ratingStore.rating.sunExposure" />
          </div>
          <div v-if="ratingStore.rating.leisure !== undefined" class="overflow-hidden">
            <p class="font-semibold mb-1">{{ $t('Leisure') }}</p>
            <RatingScore v-model:rating="ratingStore.rating.leisure" />
          </div>
          <div v-if="ratingStore.rating.immissions !== undefined" class="overflow-hidden">
            <p class="font-semibold mb-1">{{ $t('Immissions') }}</p>
            <RatingScore v-model:rating="ratingStore.rating.immissions" />
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { useRatingStore } from '@/stores/rating';
import RatingScore from '@/components/RatingScore.vue';

const ratingStore = useRatingStore();
</script>
