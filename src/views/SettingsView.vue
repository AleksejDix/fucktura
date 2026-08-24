<template>
  <DSheet :title="$t('Company settings')">
    <template #top>
      <div
        v-if="folder.currentName"
        class="flex items-center justify-between text-[9pt] text-gray-500 mb-6 pb-3 border-b border-gray-200"
      >
        <span>
          {{ $t('Current folder') }}:
          <span class="font-mono text-gray-900">📁 {{ folder.currentName }}</span>
        </span>
        <button
          type="button"
          @click="folder.openFolder()"
          class="text-[9pt] text-gray-600 hover:text-black underline"
        >
          {{ $t('Change…') }}
        </button>
      </div>
    </template>

    <div class="flex gap-2 mb-6">
      <button
        v-for="s in senderList"
        :key="s.key"
        @click="selectSender(s)"
        class="text-[9pt] px-3 py-1.5 border transition-colors"
        :class="
          form?.key === s.key
            ? 'border-gray-900 bg-gray-900 text-white'
            : 'border-gray-200 text-gray-600 hover:border-gray-400'
        "
      >
        {{ s.company || $t('New sender') }}
      </button>
      <button
        @click="addSender"
        class="text-[9pt] px-3 py-1.5 border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
      >
        + {{ $t('Add sender') }}
      </button>
    </div>

    <div v-if="form" class="text-[9pt] space-y-5">
      <section>
        <p class="text-[8pt] text-gray-900 mb-2">{{ $t('Company') }}</p>
        <div class="grid grid-cols-2 gap-2">
          <DField
            v-model="form.company"
            class="col-span-2"
            :placeholder="$t('Company name')"
            @save="save"
          />
          <DField
            v-model="form.street"
            class="col-span-2"
            :placeholder="$t('Street')"
            @save="save"
          />
          <DField v-model="form.zip" mono :placeholder="$t('ZIP')" @save="save" />
          <DField v-model="form.city" :placeholder="$t('City')" @save="save" />
          <DField
            v-model="form.country"
            class="col-span-2"
            :placeholder="$t('Country')"
            @save="save"
          />
          <DField v-model="form.email" type="email" :placeholder="$t('Email')" @save="save" />
          <DField v-model="form.website" :placeholder="$t('Website')" @save="save" />
          <DField
            v-model="form.uid"
            class="col-span-2"
            mono
            :placeholder="$t('UID')"
            @save="save"
          />
        </div>
      </section>

      <section>
        <p class="text-[8pt] text-gray-900 mb-2">{{ $t('Contact person') }}</p>
        <div class="grid grid-cols-2 gap-2">
          <DField v-model="form.contact" :placeholder="$t('Name')" @save="save" />
          <DField
            v-model="form.contactEmail"
            type="email"
            :placeholder="$t('Email')"
            @save="save"
          />
        </div>
      </section>

      <section>
        <p class="text-[8pt] text-gray-900 mb-2">{{ $t('Payment terms') }}</p>
        <div class="grid grid-cols-2 gap-2">
          <DField
            :model-value="form.invoiceDueDays"
            :label="$t('Invoice due days')"
            type="number"
            min="1"
            mono
            @save="(v) => saveDays('invoiceDueDays', v)"
          />
          <DField
            :model-value="form.quoteValidDays"
            :label="$t('Quote valid days')"
            type="number"
            min="1"
            mono
            @save="(v) => saveDays('quoteValidDays', v)"
          />
        </div>
      </section>

      <section>
        <p class="text-[8pt] text-gray-900 mb-2">{{ $t('VAT') }}</p>
        <label class="flex items-center gap-2 text-[9pt] text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            :checked="!!form.vatRegistered"
            @change="onVatToggle(($event.target as HTMLInputElement).checked)"
            class="cursor-pointer"
          />
          <span>{{ $t('VAT registered') }}</span>
          <span class="text-gray-400 text-[8pt]">{{ $t('VAT registered hint') }}</span>
        </label>
        <div class="mt-2">
          <DField
            v-model="form.taxNote"
            :label="$t('Tax note')"
            :placeholder="$t('Tax note hint')"
            @save="save"
          />
        </div>
      </section>

      <section>
        <div class="flex items-baseline justify-between mb-2">
          <p class="text-[8pt] text-gray-900">{{ $t('Bank accounts') }}</p>
          <button
            type="button"
            @click="addAccount"
            class="text-[8pt] text-gray-500 hover:text-black"
          >
            + {{ $t('Add account') }}
          </button>
        </div>
        <div v-for="(account, i) in form.accounts" :key="i" class="grid grid-cols-3 gap-2 mb-2">
          <DField v-model="account.iban" mono placeholder="IBAN" @save="save" />
          <DField v-model="account.bank" :placeholder="$t('Bank')" @save="save" />
          <div class="flex items-center gap-2">
            <DField v-model="account.bic" mono placeholder="BIC" class="flex-1" @save="save" />
            <button
              v-if="form.accounts.length > 1"
              type="button"
              @click="removeAccount(i)"
              class="text-[8pt] text-red-400 hover:text-red-600 shrink-0"
            >
              &times;
            </button>
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
  </DSheet>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { nanoid } from 'nanoid';
import type { Sender } from '@/fs/types';
import { useI18n } from 'vue-i18n';
import { useDocumentsStore } from '@/stores/documents';
import { useFolderStore } from '@/stores/folder';
import { useConfirmStore } from '@/stores/confirm';
import DSheet from '@/components/DSheet.vue';
import DField from '@/components/DField.vue';

const documentsStore = useDocumentsStore();
const folder = useFolderStore();
const confirmStore = useConfirmStore();
const { t } = useI18n();
const senderList = computed<Sender[]>(() => documentsStore.senders);
const form = ref<Sender | null>(null);

function emptySender(): Sender {
  return {
    key: '',
    company: '',
    street: '',
    zip: '',
    city: '',
    country: 'Schweiz',
    email: '',
    website: '',
    uid: '',
    contact: '',
    contactEmail: '',
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

function saveDays(field: 'invoiceDueDays' | 'quoteValidDays', value: string) {
  if (!form.value) return;
  form.value[field] = parseInt(value, 10) || 14;
  save();
}

function onVatToggle(checked: boolean) {
  if (!form.value) return;
  form.value.vatRegistered = checked;
  save();
}

async function save() {
  if (!form.value) return;
  if (!form.value.key) form.value.key = nanoid(8);
  const raw: Sender = JSON.parse(JSON.stringify(form.value));
  await documentsStore.saveSender(raw);
}

async function deleteSender() {
  if (!form.value?.key) return;
  const label = form.value.company || form.value.key;
  const ok = await confirmStore.ask({
    message: t('Delete sender confirm', { name: label }),
    confirmLabel: t('Delete'),
    destructive: true,
  });
  if (!ok) return;
  await documentsStore.removeSender(form.value.key);
  form.value = senderList.value.length > 0 ? cloneSender(senderList.value[0]) : emptySender();
}
</script>
