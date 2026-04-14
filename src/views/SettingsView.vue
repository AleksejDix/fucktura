<template>
  <div class="w-[210mm] mx-auto py-8 px-[26mm] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] print:shadow-none my-4">
    <div v-if="folder.currentName" class="flex items-center justify-between text-[9pt] text-gray-500 mb-6 pb-3 border-b border-gray-200">
      <span>
        {{ $t('Current folder') }}:
        <span class="font-mono text-gray-900">📁 {{ folder.currentName }}</span>
      </span>
      <button
        type="button"
        @click="folder.openFolder()"
        class="text-[9pt] text-gray-600 hover:text-black underline"
      >{{ $t('Change…') }}</button>
    </div>

    <p class="text-[14pt] font-bold text-gray-900 mb-6">{{ $t('Company settings') }}</p>

    <div class="flex gap-2 mb-6">
      <button
        v-for="s in senderList"
        :key="s.key"
        @click="selectSender(s)"
        class="text-[9pt] px-3 py-1.5 border transition-colors"
        :class="form?.key === s.key ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'"
      >{{ s.company || $t('New sender') }}</button>
      <button
        @click="addSender"
        class="text-[9pt] px-3 py-1.5 border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
      >+ {{ $t('Add sender') }}</button>
    </div>

    <div v-if="form" class="text-[9pt] space-y-5">
      <section>
        <p class="text-[8pt] text-gray-900 mb-2">{{ $t('Company') }}</p>
        <div class="grid grid-cols-2 gap-2">
          <input v-model="form.company" @blur="save" :placeholder="$t('Company name')" class="col-span-2 border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <input v-model="form.street" @blur="save" :placeholder="$t('Street')" class="col-span-2 border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <input v-model="form.zip" @blur="save" :placeholder="$t('ZIP')" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full font-mono" />
          <input v-model="form.city" @blur="save" :placeholder="$t('City')" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <input v-model="form.country" @blur="save" :placeholder="$t('Country')" class="col-span-2 border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <input v-model="form.email" @blur="save" :placeholder="$t('Email')" type="email" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <input v-model="form.website" @blur="save" :placeholder="$t('Website')" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <input v-model="form.uid" @blur="save" :placeholder="$t('UID')" class="col-span-2 border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full font-mono" />
        </div>
      </section>

      <section>
        <p class="text-[8pt] text-gray-900 mb-2">{{ $t('Contact person') }}</p>
        <div class="grid grid-cols-2 gap-2">
          <input v-model="form.contact" @blur="save" :placeholder="$t('Name')" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <input v-model="form.contactEmail" @blur="save" :placeholder="$t('Email')" type="email" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
        </div>
      </section>

      <section>
        <p class="text-[8pt] text-gray-900 mb-2">{{ $t('Payment terms') }}</p>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('Invoice due days') }}</label>
            <input v-model.number="form.invoiceDueDays" @blur="save" type="number" min="1" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full font-mono" />
          </div>
          <div>
            <label class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('Quote valid days') }}</label>
            <input v-model.number="form.quoteValidDays" @blur="save" type="number" min="1" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full font-mono" />
          </div>
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
          <input v-model="account.iban" @blur="save" placeholder="IBAN" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full font-mono" />
          <input v-model="account.bank" @blur="save" :placeholder="$t('Bank')" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full" />
          <div class="flex items-center gap-2">
            <input v-model="account.bic" @blur="save" placeholder="BIC" class="border-b border-gray-200 py-1.5 text-[9pt] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 bg-transparent w-full font-mono flex-1" />
            <button
              v-if="form.accounts.length > 1"
              type="button"
              @click="removeAccount(i)"
              class="text-[8pt] text-red-400 hover:text-red-600 shrink-0"
            >&times;</button>
          </div>
        </div>
      </section>

      <div class="flex items-center gap-3 pt-2 border-t border-gray-200">
        <button
          v-if="form.key && senderList.length > 1"
          type="button"
          @click="deleteSender"
          class="text-red-500 text-[9pt] font-medium px-5 py-1.5 hover:bg-red-50 transition-colors"
        >
          {{ $t('Delete') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { nanoid } from 'nanoid';
import * as repo from '@/fs/repo';
import type { Sender } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import { useFolderStore } from '@/stores/folder';

const documentsStore = useDocumentsStore();
const folder = useFolderStore();
const senderList = computed<Sender[]>(() => documentsStore.senders);
const form = ref<Sender | null>(null);

function emptySender(): Sender {
  return {
    key: '',
    company: '', street: '', zip: '', city: '', country: 'Schweiz',
    email: '', website: '', uid: '',
    contact: '', contactEmail: '',
    accounts: [{ iban: '', bank: '', bic: '' }],
    invoiceDueDays: 14,
    quoteValidDays: 14,
  };
}

function cloneSender(s: Sender): Sender {
  return { ...s, accounts: s.accounts.map((a) => ({ ...a })) };
}

onMounted(() => {
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

function removeAccount(i: number) {
  form.value?.accounts.splice(i, 1);
  save();
}

async function save() {
  if (!form.value) return;
  if (!form.value.key) form.value.key = nanoid(8);
  const raw: Sender = JSON.parse(JSON.stringify(form.value));
  await repo.writeSender(raw);
  await documentsStore.load();
}

async function deleteSender() {
  if (!form.value?.key) return;
  await repo.deleteSender(form.value.key);
  await documentsStore.load();
  form.value = senderList.value.length > 0 ? cloneSender(senderList.value[0]) : emptySender();
}
</script>
