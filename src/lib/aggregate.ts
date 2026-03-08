import type { Category, Data } from '@/api/dossiers';

export interface CategoryConfig {
  listCategoryType: number;
  color: string;
}

export function aggregatedPoiList(
  data: Pick<Data, 'theming' | 'property' | 'categories'> | null,
  categoryConfig: CategoryConfig[],
  maxVisibleMarker = 1,
) {
  if (!data) return [];

  try {
    const fallbackColor = 'ff000';
    const homePinColor = data.theming.color1.replace('#', '') || fallbackColor;
    const homePin = { ...data.property.coordinates, color: homePinColor, label: '' };

    const categories = Object.values(data.categories).filter((categoryItem: Category) =>
      categoryConfig.some(
        (item) => item.listCategoryType === categoryItem['category'].listCategoryType,
      ),
    );

    const poiList = categories.flatMap((categoryItem: Category) => {
      const colorItem = categoryConfig.find(
        (item) => item.listCategoryType === categoryItem['category'].listCategoryType,
      );
      const filteredCategoryItem = categoryItem.pois.filter(
        (poi, index) => index <= maxVisibleMarker,
      );
      return filteredCategoryItem.map((poi, index) => {
        return {
          label: String(index + 1),
          latitude: poi.addressInfo.lat,
          longitude: poi.addressInfo.lng,
          color: colorItem?.color || '',
        };
      });
    });

    poiList.push(homePin);

    return poiList;
  } catch (error) {
    console.error('Error while aggregating POIs ', error);
    return [];
  }
}
