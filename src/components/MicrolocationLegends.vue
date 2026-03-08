<template>
  <div class="flex w-full justify-around text-[10px]">
    <div class="inline-flex gap-x-3 items-center">
      <span class="block w-[4mm] h-[4mm] rounded-2xl bg-[#467d08]"></span>
      <span> {{ $t('Very Good') }} </span>
    </div>
    <div class="inline-flex gap-x-3 items-center">
      <span class="block w-[4mm] h-[4mm] rounded-2xl bg-[#6bcb1d]"></span>
      <span> {{ $t('Good') }} </span>
    </div>
    <div class="inline-flex gap-x-3 items-center">
      <span class="block w-[4mm] h-[4mm] rounded-2xl bg-[#d4dd16]"></span>
      <span> {{ $t('Average') }} </span>
    </div>
    <div class="inline-flex gap-x-3 items-center">
      <span class="block w-[4mm] h-[4mm] rounded-2xl bg-[#ea7506]"></span>
      <span> {{ $t('Bad') }} </span>
    </div>
    <div class="inline-flex gap-x-3 items-center">
      <span class="block w-[4mm] h-[4mm] rounded-2xl bg-[#cc241d]"></span>
      <span> {{ $t('Very Bad') }} </span>
    </div>
  </div>
</template>
