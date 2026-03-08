<template>
  <img
    v-if="attrs.src && isSuccess"
    alt=""
    ref="imageWithPlaceholder"
    @error="imageOnError"
    @load="imageOnLoad"
  />
  <div v-else class="flex items-center justify-center text-5xl bg-slate-200">
    <i class="fa-regular fa-image-slash" />
  </div>
</template>

<script setup lang="ts">
const isSuccess = ref(true);
const attrs = useAttrs();
const imageOnError = () => {
  isSuccess.value = false;
};

const imageOnLoad = () => {
  isSuccess.value = true;
};
</script>
