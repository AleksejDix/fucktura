import { useGalleryStore } from '@/stores/gallery';
import { useSimilarObjectsStore } from '@/stores/similar-objects';
import { defineStore } from 'pinia';
import { computed, markRaw, ref } from 'vue';
import * as Pages from '@/components/pages';
import { ImageGallery, SimilarObjects, SimilarObjectsMap } from '@/components/pages';
import { useModeStore } from './mode';

export const PAGES = [
  Pages.Cover,
  Pages.PropertyDetails,
  Pages.MarketSituation,
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
  Pages.ImageGallery, // 0 or more
  Pages.Disclaimer,
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

    // Don't cache image gallery pages, because those are changing with the number
    // of images, which in turn is generated based on the number of images in gallery.
    if (name !== 'ImageGallery') cache[name] = page;

    return page;
  }
}

export const usePagesStore = defineStore('pages', () => {
  const gallery = useGalleryStore();
  const similarObjects = useSimilarObjectsStore();
  const modeStore = useModeStore();

  function arrayOfNulls<T>(length: number): (T | null)[] {
    return new Array(length).fill(null);
  }

  function getImageGalleryPages(): Page[] {
    const numberOfGalleryPages = Math.ceil(gallery.images.length / gallery.imagesPerPage);
    const numberOfEmptyGalleryPages = modeStore.isEditMode && numberOfGalleryPages === 0 ? 1 : 0;

    return arrayOfNulls(numberOfGalleryPages + numberOfEmptyGalleryPages).map(
      (_, galleryPageIndex) => createPage(ImageGallery, { galleryPageIndex }),
    );
  }

  const shouldDisplaySimilarObjectsPage = computed(() => similarObjects.objects.length > 0);

  function getSimilarObjectsPages(): Page[] {
    return shouldDisplaySimilarObjectsPage.value ? [createPage(SimilarObjects)] : [];
  }

  function getSimilarObjectsMapPages(): Page[] {
    return shouldDisplaySimilarObjectsPage.value ? [createPage(SimilarObjectsMap)] : [];
  }

  // Siamese pages are pages that are created from multiplying a page definition 0 or more times.
  // This is different to most other pages, where there is a 1:1 correlation between how many pages
  // there are in the PAGES array.
  // An example ofa Siamese page is the ImageGallery. There is one mentioned in the PAGES array,
  // but there can be 0 or more pages depending on how many images there are to be displayed.
  // On top of that the number of pages changes depending on the user adding/removing images in edit mode.
  const MAX_SIAMESE_PAGE_DEPTH = 2;

  const pages = ref<Page[]>([]);

  /**
   * This function can be used when the content of any of the Siamese pages changes,
   * for example when images are added/removed from the gallery
   */
  function updateListOfPages() {
    pages.value = PAGES.map((page) => {
      const name = page.__name || 'Cover';
      switch (name) {
        case 'ImageGallery':
          return getImageGalleryPages();
        case 'SimilarObjects':
          return getSimilarObjectsPages();
        case 'SimilarObjectsMap':
          return getSimilarObjectsMapPages();
        default:
          return createPage(page);
      }
    }).flat(MAX_SIAMESE_PAGE_DEPTH);
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
