<template>
  <PageTemplate :page-index="pageIndex">
    <div class="pb-[5mm]">
      <section class="grid gap-y-4">
        <h2 contenteditable="false">{{ $t('Disclaimer Valuation') }}</h2>
        <p contenteditable="false" class="max-w-prose">
          The valuation is a data driven estimate, which is based on artificial intelligence,
          similar objects in the market and the quality of the micro location. The actual price can
          be influenced by many other factors such as negotiation or wrong input data. We do not
          assume any liability on the precision of the valuation, nor do we assume any liability for
          any direct and in direct disadvantages accruing from the appliance of any information
          provided by our valuation. The terms of use apply.
        </p>
      </section>
    </div>
  </PageTemplate>
</template>

<script setup lang="ts">
import PageTemplate from '../PageTemplate.vue';

defineProps({ pageIndex: { type: Number, default: 0 } });
</script>
