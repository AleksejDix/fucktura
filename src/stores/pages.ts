import { defineStore } from 'pinia';
import { computed, markRaw, ref, watch } from 'vue';
import * as Pages from '@/components/pages';
import { useDocumentsStore } from './documents';

export type PageName = keyof typeof Pages;
export type PageType = (typeof Pages)[PageName];

export interface Page {
  id: string;
  name: PageName;
  component: PageType;
  enabled: boolean;
  metadata: Record<string, unknown>;
}

export const usePagesStore = defineStore('pages', () => {
  const documentsStore = useDocumentsStore();
  const pages = ref<Page[]>([]);

  function componentForType(type: string): PageType | null {
    switch (type) {
      case 'invoice':
        return Pages.Invoice;
      case 'quote':
        return Pages.Quote;
      case 'reminder':
        return Pages.Reminder;
      case 'receipt':
        return Pages.Receipt;
      default:
        return null;
    }
  }

  function buildPages() {
    const result: Page[] = [];

    for (const doc of documentsStore.visibleDocuments) {
      const component = componentForType(doc.type);
      if (!component) continue;

      result.push({
        id: `doc-${doc.number}`,
        name: component.__name as PageName,
        component: markRaw(component),
        enabled: true,
        metadata: { doc, sender: doc.sender },
      });

      const hasSwissIban = doc.sender?.accounts?.some((a: { iban: string }) =>
        a.iban.startsWith('CH'),
      );
      if ((doc.type === 'invoice' || doc.type === 'reminder') && hasSwissIban) {
        result.push({
          id: `doc-${doc.number}-qr`,
          name: 'QRBill' as PageName,
          component: markRaw(Pages.QRBill),
          enabled: true,
          metadata: { doc, sender: doc.sender },
        });
      }
    }

    pages.value = result;
  }

  watch(
    [() => documentsStore.visibleDocuments, () => documentsStore.activeDocumentNumber],
    buildPages,
    { immediate: true },
  );

  const pageNumbers = computed(() => {
    let pageNumber = 1;
    return pages.value.map((page) => (page.enabled ? pageNumber++ : null));
  });

  const numberOfVisiblePages = computed(() => {
    return pages.value.reduce((acc, page) => (page.enabled ? acc + 1 : acc), 0);
  });

  return {
    pages,
    pageNumbers,
    numberOfVisiblePages,
    buildPages,
  };
});
