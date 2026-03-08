<template>
  <div class="p-4">
    <div class="grid grid-cols-3 grid-rows-2 gap-y-4">
      <div class="box col-span-1 h-4 w-12 outline-dotted outline-[#34d399]"></div>
      <div class="flex items-center col-span-2">
        <p>{{ $t('Editable content') }}</p>
      </div>
      <span class="text-base col-span-1">
        <i class="fa-solid fa-eye"></i>
        /
        <i class="fa-solid fa-eye-slash"></i>
      </span>
      <div class="flex items-center col-span-2">
        <p>Show/Hide page in print</p>
      </div>
    </div>
  </div>
</template>
