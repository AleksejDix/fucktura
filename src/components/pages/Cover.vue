<template>
  <PageTemplate :page-index="pageIndex" :show-icon="false">
    <section class="grid gap-[0.5cm]">
      <figure>
        <div class="aspect-[3/2] relative">
          <CDNImage :src="global.data?.images.main" size="xl" class="absolute inset-0" />
          <figcaption
            class="absolute bottom-0 py-4 -left-[1px] space-y-4 text-3xl text-primary font-bold text-left"
          >
            <ContentEditablePriceField
              class="bg-white inline-block px-4 py-3"
              v-model:modelValue="priceStore.selected.price"
            >
              <template #readOnlyContent>
                <p data-testid="page-cover-price-text">
                  {{ formattedPrice }}
                </p>
              </template>
            </ContentEditablePriceField>
            <div>
              <div class="bg-white inline-block px-4 py-3">
                {{ global.data?.address }}
              </div>
            </div>
          </figcaption>
        </div>
      </figure>

      <div class="grid gap-y-4 py-8">
        <header>
          <h2 contenteditable="false">{{ global.data?.teaser }}</h2>
          <p contenteditable="false">{{ $t('Market value analysis - Overview') }}</p>
        </header>

        <div class="grid grid-cols-2 gap-8">
          <div>
            <image-with-placeholder
              :src="global.data?.property.imageSrcSmall"
              class="w-full h-full object-cover"
            />
          </div>
          <DTable variant="horizontal" :columns="columns" class="w-full" :data="tableData">
            <template #col-propertyType="{ propertyType }">
              <div class="text-right text-gray-500" contenteditable="false">
                {{ propertyType || $t('Data not available') }}
              </div>
            </template>
            <template #col-builtYear="{ builtYear }">
              <div class="text-right text-gray-500" contenteditable="false">
                <span v-if="builtYear" notranslate>{{ builtYear }} </span>
                <span v-else>{{ $t('Data not available') }}</span>
              </div>
            </template>
            <template #col-livingArea="{ livingArea }">
              <div class="text-right text-gray-500" contenteditable="false">
                <span v-if="livingArea" notranslate>{{ livingArea }} </span>
                <span v-else>{{ $t('Data not available') }}</span>
              </div>
            </template>
            <template #col-propertyArea="{ propertyArea }">
              <div class="text-right text-gray-500" contenteditable="false">
                <span v-if="propertyArea" notranslate>{{ propertyArea }} </span>
                <span v-else>{{ $t('Data not available') }}</span>
              </div>
            </template>
            <template #col-roomCount="{ roomCount }">
              <div class="text-right text-gray-500" contenteditable="false">
                <span v-if="roomCount" notranslate>{{ roomCount }} </span>
                <span v-else>{{ $t('Data not available') }}</span>
              </div>
            </template>
            <template #col-renovationYear="{ renovationYear }">
              <div class="text-right text-gray-500" contenteditable="false">
                <span v-if="renovationYear" notranslate>{{ renovationYear }} </span>
                <span v-else>{{ $t('Data not available') }}</span>
              </div>
            </template>
          </DTable>
        </div>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { formatPrice } from '@/formatters/currency';
import { roundToStep } from '@/functions/roundToStep';
import { useGlobalStore } from '@/stores/global';
import { usePriceStore } from '@/stores/price';
import CDNImage from '@/components/CDNImage.vue';
import ContentEditablePriceField from '@/components/ContentEditablePriceField.vue';
import DTable from '../DTable.vue';
import type { Columns } from '../DTable.vue';
import PageTemplate from '../PageTemplate.vue';
import { useI18n } from 'vue-i18n';

defineProps({ pageIndex: { type: Number, default: 0 } });

const global = useGlobalStore();
const priceStore = usePriceStore();
const { t } = useI18n();

const formattedPrice = computed(() => formatPrice(roundToStep(priceStore.selected.price, 10000)));

const columns: Columns = {
  propertyType: t('Building type'),
  builtYear: t('Year of construction'),
  livingArea: t('Living Area'),
  propertyArea: t('Property Area'),
  roomCount: t('Rooms'),
  renovationYear: t('Renovation Year'),
};

const tableData = [
  {
    propertyType: global.data?.property?.propertyType, // <i notranslate class='fak fa-fw text-3xl fa-home '></i>
    roomCount: global.data?.property?.roomCount, // <i notranslate class='fak fa-fw text-3xl fa-bed '></i>
    livingArea: global.data?.property?.livingArea && `${global.data?.property?.livingArea} m2`, // <i notranslate class='fak fa-fw text-3xl fa-living-space '></i>
    builtYear: global.data?.property?.builtYear, //  <i notranslate class='fak fa-fw text-3xl fa-construction '></i>
    propertyArea: `${global.data?.parcel?.data?.area || 'N/A'}${global.data?.parcel?.data?.area ? ' m2' : ''}`, // <i notranslate class='fak  fa-fw text-3xl fa-plot-size '></i>
    renovationYear: global.data?.property?.renovationYear, // <i notranslate class='fa-regular  fa-fw text-3xl fa-paint-roller' data-fa-transform='flip-h'></i>
  },
];
</script>
