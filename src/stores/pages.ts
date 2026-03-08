import { useSimilarObjectsStore } from '@/stores/similar-objects';
import { defineStore } from 'pinia';
import { computed, markRaw, ref } from 'vue';
import * as Pages from '@/components/pages';
import { SimilarObjects, SimilarObjectsMap } from '@/components/pages';

export const PAGES = [
  Pages.Letter,
  Pages.Cover,
  Pages.PropertyDetails,
  Pages.SimilarObjectsMap, // 0 or 1
  Pages.SimilarObjects, // 0 or 1
  Pages.MicrolocationAccessibility,
  Pages.Microlocation,
  Pages.MicrolocationSilence,
  Pages.MicrolocationEducation,
  Pages.MicrolocationShopping,
  Pages.MicrolocationView,
  Pages.MicrolocationConnectivity,
  Pages.MicrolocationImmissions,
  Pages.ConstructionSites,
  Pages.CommuneOne,
  Pages.CommuneTwo,
  Pages.Disclaimer,
  Pages.QRBill,
] as const;

export type PageName = keyof typeof Pages;
export type PageType = typeof Pages[PageName];
export type PageNumbers = Record<PageName, boolean>;
export type PageVisibilities = Record<PageName, boolean>;

export interface Page {
  id: string;
  name: PageName;
  component: PageType;
  enabled: boolean;
  metadata: any;
}

// Cache of generated pages
const cache: Partial<Record<PageName, Page>> = {};

function createPage(component: PageType, metadata = {}, enabled = true): Page {
  const name = (component.__name || 'Cover') as PageName;
  const cached = cache[name];
  if (cached) {
    return cached;
  } else {
    const page = {
      id: crypto.randomUUID(),
      name: (component.__name || 'Cover') as PageName,
      enabled,
      component: markRaw(component || Pages.Cover),
      metadata,
    };

    cache[name] = page;

    return page;
  }
}

export const usePagesStore = defineStore('pages', () => {
  const similarObjects = useSimilarObjectsStore();

  const shouldDisplaySimilarObjectsPage = computed(() => similarObjects.objects.length > 0);

  function getSimilarObjectsPages(): Page[] {
    return shouldDisplaySimilarObjectsPage.value ? [createPage(SimilarObjects)] : [];
  }

  function getSimilarObjectsMapPages(): Page[] {
    return shouldDisplaySimilarObjectsPage.value ? [createPage(SimilarObjectsMap)] : [];
  }

  const pages = ref<Page[]>([]);

  function updateListOfPages() {
    pages.value = PAGES.map((page) => {
      const name = page.__name || 'Cover';
      switch (name) {
        case 'SimilarObjects':
          return getSimilarObjectsPages();
        case 'SimilarObjectsMap':
          return getSimilarObjectsMapPages();
        default:
          return createPage(page);
      }
    }).flat(2);
  }

  updateListOfPages();

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
    updateListOfPages,
  };
});
