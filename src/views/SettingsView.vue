<template>
  <div class="w-[210mm] mx-auto py-8 px-[26mm] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] print:shadow-none my-4">
    <p class="text-[14pt] font-bold text-gray-900 mb-6">{{ $t('Company settings') }}</p>

    <div class="flex gap-2 mb-6">
      <button
        v-for="s in senderList"
        :key="s.id"
        @click="selectSender(s)"
        class="text-[9pt] px-3 py-1.5 border transition-colors"
        :class="form?.id === s.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'"
      >{{ s.name || $t('New sender') }}</button>
      <button
        @click="addSender"
        class="text-[9pt] px-3 py-1.5 border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
      >+ {{ $t('Add sender') }}</button>
    </div>

    <form v-if="form" @submit.prevent="save" class="text-[9pt] space-y-5">
      <section>
        <p class="text-[8pt] text-gray-900 mb-2">{{ $t('Company') }}</p>
        <div class="grid grid-cols-2 gap-2">
          <input v-model="form.name" :placeholder="$t('Company name')" class="col-span-2 border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <input v-model="form.street" :placeholder="$t('Street')" class="col-span-2 border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <input v-model="form.zip" :placeholder="$t('ZIP')" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full font-mono" />
          <input v-model="form.city" :placeholder="$t('City')" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <input v-model="form.email" :placeholder="$t('Email')" type="email" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <input v-model="form.website" :placeholder="$t('Website')" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <input v-model="form.uid" :placeholder="$t('UID')" class="col-span-2 border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full font-mono" />
        </div>
      </section>

      <section>
        <p class="text-[8pt] text-gray-900 mb-2">{{ $t('Contact person') }}</p>
        <div class="grid grid-cols-2 gap-2">
          <input v-model="form.contact" :placeholder="$t('Name')" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <input v-model="form.contactEmail" :placeholder="$t('Email')" type="email" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
        </div>
      </section>

      <section>
        <div class="flex items-baseline justify-between mb-2">
          <p class="text-[8pt] text-gray-900">{{ $t('Bank accounts') }}</p>
          <button type="button" @click="addAccount" class="text-[8pt] text-gray-500 hover:text-black">
            + {{ $t('Add account') }}
          </button>
        </div>
        <div v-for="(account, i) in form.accounts" :key="i" class="grid grid-cols-3 gap-2 mb-2">
          <input v-model="account.iban" placeholder="IBAN" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full font-mono" />
          <input v-model="account.bank" :placeholder="$t('Bank')" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <div class="flex items-center gap-2">
            <input v-model="account.bic" placeholder="BIC" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full font-mono flex-1" />
            <button
              v-if="form.accounts.length > 1"
              type="button"
              @click="form.accounts.splice(i, 1)"
              class="text-[8pt] text-red-400 hover:text-red-600 shrink-0"
            >&times;</button>
          </div>
        </div>
      </section>

      <div class="flex items-center gap-3 pt-2 border-t border-gray-200">
        <button type="submit" class="bg-black text-white text-[9pt] font-medium px-5 py-1.5 hover:bg-gray-800 transition-colors">
          {{ $t('Save') }}
        </button>
        <button
          v-if="form.id && senderList.length > 1"
          type="button"
          @click="deleteSender"
          class="text-red-500 text-[9pt] font-medium px-5 py-1.5 hover:bg-red-50 transition-colors"
        >
          {{ $t('Delete') }}
        </button>
        <span v-if="saved" class="text-[8pt] text-green-600">{{ $t('Saved') }}</span>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '@/db';
import type { Sender } from '@/db';
import { useDocumentsStore } from '@/stores/documents';

const documentsStore = useDocumentsStore();
const senderList = ref<Sender[]>([]);
const form = ref<Sender | null>(null);
const saved = ref(false);

function emptySender(): Sender {
  return {
    name: '', street: '', zip: '', city: '',
    email: '', website: '', uid: '',
    contact: '', contactEmail: '',
    accounts: [{ iban: '', bank: '', bic: '' }],
  };
}

function cloneSender(s: Sender): Sender {
  return { ...s, accounts: s.accounts.map((a) => ({ ...a })) };
}

async function loadSenders() {
  senderList.value = await db.senders.toArray();
}

onMounted(async () => {
  await loadSenders();
  if (senderList.value.length > 0) {
    form.value = cloneSender(senderList.value[0]);
  } else {
    form.value = emptySender();
  }
});

function selectSender(s: Sender) {
  form.value = cloneSender(s);
}

function addSender() {
  form.value = emptySender();
}

function addAccount() {
  form.value?.accounts.push({ iban: '', bank: '', bic: '' });
}

async function save() {
  if (!form.value) return;
  saved.value = false;

  if (form.value.id) {
    await db.senders.update(form.value.id, { ...form.value });
  } else {
    form.value.id = await db.senders.add({ ...form.value }) as number;
  }

  await loadSenders();
  await documentsStore.load();
  saved.value = true;
  setTimeout(() => { saved.value = false; }, 2000);
}

async function deleteSender() {
  if (!form.value?.id) return;
  await db.senders.delete(form.value.id);
  await loadSenders();
  await documentsStore.load();
  form.value = senderList.value.length > 0 ? cloneSender(senderList.value[0]) : emptySender();
}
</script>
