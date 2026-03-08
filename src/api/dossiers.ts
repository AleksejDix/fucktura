import type { FeatureCollection, MultiPolygon } from 'geojson';
import type { Nullable } from '@/lib/types';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Agency {
  addressLine1: string;
  addressLine2: string;
  name: string;
  phone: string;
  email: string;
}

export interface CategoryInfo {
  listCategoryType: number;
  name: string;
  topCategory: number;
}

export interface AddressInfo {
  addressFormated: string;
  lat: number;
  lng: number;
}

export interface POI {
  addressInfo: AddressInfo;
  distance: number;
  itemCategoryIcon: string;
  itemCategoryName: string;
  itemCategoryPublicId: string;
  listCategoryType: number;
  name: string;
  publicId: string;
}

export interface Category {
  category: CategoryInfo;
  pois: POI[];
}

export interface Categories {
  BusTramStop: Category;
  Daycare: Category;
  Gastronomy: Category;
  HighSchool: Category;
  Kindergarten: Category;
  MotorwayAccess: Category;
  NationalAirport: Category;
  PrimarySchool: Category;
  RegionalAirport: Category;
  SecondarySchool: Category;
  Services: Category;
  Shopping: Category;
  TrainStation: Category;
  UniversityCollage: Category;
}

export interface PriceTrendItem {
  averagePrice: number;
  quarter: number;
  year: number;
}

export interface TransactionPrice {
  value: number;
  min: number;
  max: number;
  confidence: number;
  isValid: boolean;
}

export interface Stats {
  locality: unknown;
  state: unknown;
}

export interface TransactionItem {
  price: TransactionPrice;
  pricePerSqm: TransactionPrice;
  currencyCode: string;
  stats: Stats;
  dealType: number;
  year: number;
  quarter: number;
}

export interface PriceTrend {
  price: PriceTrendItem[];
  transactions: TransactionItem[];
}

export interface Charts {
  priceTrend: PriceTrend;
}

export interface AgeAndGenderDistributionItem {
  ageRange: string;
  femaleRelativeRate: number;
  maleRelativeRate: number;
}

export interface AgeAndGenderDistribution {
  year?: number;
  canton: AgeAndGenderDistributionItem[];
  commune: AgeAndGenderDistributionItem[];
  country: AgeAndGenderDistributionItem[];
}

export interface CommuneAvgMonthlyInsurance {
  adult: number;
  child: number;
  year: number;
  youngAdult: number;
}

export interface ForeignersDevelopmentItem {
  foreignersPopulationAbsolute: number;
  foreignersPopulationPercentage: number;
  swissPopulationAbsolute: number;
  totalPopulationAbsolute: number;
  year: number;
}

export interface ForeignersDevelopment {
  [key: string]: ForeignersDevelopmentItem[];
  canton: ForeignersDevelopmentItem[];
  commune: ForeignersDevelopmentItem[];
  country: ForeignersDevelopmentItem[];
}

export interface PopulationGrowthItem {
  absoluteValue: number;
  relativeChangeRate: number;
  year: number;
}

export interface PopulationGrowth {
  [key: string]: PopulationGrowthItem[] | number;
  canton: PopulationGrowthItem[];
  commune: PopulationGrowthItem[];
  country: PopulationGrowthItem[];
  year: number;
}

export interface TaxBurdenItem {
  assets: number;
  burden: number;
  income: number;
  rank: number;
}

export interface TaxBurden {
  [key: string]: TaxBurdenItem[] | number;
  marriedPensioner: TaxBurdenItem[];
  marriedWithChildren: TaxBurdenItem[];
  single: TaxBurdenItem[];
  totalNumberOfCommunesInCanton: number;
  year: number;
}

export interface TaxRate {
  avgCantonCatolicTaxRate: number;
  avgCantonCommunalTaxRate: number;
  avgCantonProtestantTaxRate: number;
  cantonName: string;
  catolicTaxRate: number;
  catolicTaxRateRank: number;
  communalTaxRate: number;
  communalTaxRateRank: number;
  communeName: string;
  numberOfCommunesInCanton: number;
  protestantTaxRate: number;
  protestantTaxRateRank: number;
  year: number;
}

export interface ConstructionSite {
  address: string;
  addressCoordinates: Coordinates;
  created: string;
  distance: number;
  status: string;
  title: string;

  levelCount?: number;
  startDate?: string;
}

export interface Commune {
  ageAndGenderDistribution: AgeAndGenderDistribution;
  communeAvgMonthlyInsurance: CommuneAvgMonthlyInsurance;
  foreignersDevelopment: ForeignersDevelopment;
  populationGrowth: PopulationGrowth;
  taxBurden: TaxBurden;
  taxRate: TaxRate;
  constructionSites: ConstructionSite[];
}

export interface Employee {
  email: string;
  name: string;
  phone: string;
}

export interface GalleryItem {
  category: string;
  classification: string;
  image: string;
  id: string;
}

export interface Images {
  agencyLogo: string;
  avatar: string;
  gallery: GalleryItem[];
  main: string;
  overview: string;

  // used but is it being sent?
  cadastreMap?: string;

  /** eDossier custom calculated field */
  detailImageOne: string;
  /** eDossier custom calculated field */
  detailImageTwo: string;
}

export interface ConnectivityItem {
  addressCoordinates: Coordinates;
  distance: number;
  name: string;
  type: string;
}

export interface Connectivity {
  list: ConnectivityItem[];
  rating: number;
  title: string;
}

export interface EducationItem {
  addressCoordinates: Coordinates;
  distance: number;
  name: string;
}

export interface Education {
  list: EducationItem[];
  rating: number;
  title: string;
}

export interface ImmissionsItem {
  addressCoordinates: Coordinates;
  category: string;
  distance: number;
}

export interface Immissions {
  list: ImmissionsItem[];
  rating: number;
  title: string;
}

export interface Leisure {
  rating: number;
  title: string;
}

export interface NoiseItem {
  railwayDay: number;
  railwayNight: number;
  rating: number;
  roadDay: number;
  roadNight: number;
}

export interface Noise {
  list: NoiseItem;
  rating: number;
  title: string;
}

export interface ServiceItem {
  address: string;
  addressCoordinates: Coordinates;
  distance: number;
  name: string;
}

export interface Services {
  list: ServiceItem[];
  rating: number;
  title: string;
}

export interface SunExposure {
  rating: number;
  title: string;
}

export interface ViewItem {
  averageCloudCoveragePercent: number;
  expositionDegrees: number;
  rating: number;
  slopeDegrees: number;
  slopePercent: number;
  summerSunshineDailyHours: number;
  viewType: number;
  lakeViewType: string;
  visibleMountainsPeaksCount: number;
  winterSunshineDailyHours: number;
}

export interface View {
  list: ViewItem;
  rating: number;
  title: string;
}

export interface Neighborhood {
  connectivity: Connectivity;
  education: Education;
  immissions: Immissions;
  leisure: Leisure;
  noise: Noise;
  services: Services;
  sunExposure: SunExposure;
  view: View;
  overallRating?: number;
}
export interface ParcelBuildingEntranceAddress {
  locality: string;
  street: string;
  streetNumber: string;
  zip: string;
}

export interface ParcelBuildingEntranceApartment {
  ewid: number;
  id: string;
  level: string;
  levelNumber: number;
  livingArea: number;
  rooms: number;
  adminNumber?: string;
  position?: string;
}

export interface ParcelBuildingEntrance {
  address: ParcelBuildingEntranceAddress;
  apartments: ParcelBuildingEntranceApartment[];
  coordinates: Coordinates;
  id: string;
}

export interface ParcelBuildingPicture {
  category: number;
  classification: number;
  id: string;
  position: number;
  url: string;
}

export interface ParcelBuilding {
  buildingArea: number;
  category: number;
  egid: number;
  entrances: ParcelBuildingEntrance[];
  height: number;
  id: string;
  numberOfEntrances: number;
  pictures: ParcelBuildingPicture[];
  totalFloors: number;
  builtYear?: number;
  renovationYear?: number;
  number?: string;
}

export interface CommuneAvgMonthlyInsurance {
  adult: number;
  child: number;
  year: number;
  youngAdult: number;
}

export interface ParcelData {
  area: number;
  bfsNumber: number;
  buildings: ParcelBuilding[];
  cadasterNumber: number;
  cadastreDistrict: string;
  canton: string;
  cantonId: string;
  cantonShort: string;
  commune: string;
  communeAvgMonthlyInsurance: CommuneAvgMonthlyInsurance;
  communeId: string;
  coordinates: Coordinates;
  developmentPotential: number;
  egrid: string;
  externalLinks: string;
  governmentZone: boolean;
  id: string;
  landToBuildlingRatioUsed: number;
  locality: string;
  numberOfBuildings: number;
  numberOfUnits: number;
  oerebLink: string;
  parcelNumber: string;
  plotRatioUsed: number;
  potentialCubingRatioMax: string;
  potentialCubingRatioMin: string;
  potentialLandToBuildingRatioMax: string;
  potentialLandToBuildingRatioMin: string;
  potentialPlotRatioMin: number;
  rawZone: string;
  zip: number;
  zone: string;
  zoneGroup: number;
}

export interface Parcel {
  data: ParcelData;
  zoneGroup?: string;
  zoneGroups: string[];
}

export interface Price {
  confidence: number;
  price: number;
  priceM2: number;
  priceM2Max: number;
  priceM2Min: number;
  priceMax: number;
  priceMin: number;
}

export interface Prices {
  ad: Price;
  transaction?: Price;
}

export interface PropertyBuildingCondition {
  values: string[];
  value: string;
}

export interface PropertyConstructionQuality {
  values: string[];
  value: string;
}

export interface PropertyMicrolocation {
  values: string[];
  value: string;
}

export enum HouseType {
  Detached = 1,
  Attached = 2,
}

export interface Property {
  bathroomCount?: Nullable<number>;
  buildingCondition: PropertyBuildingCondition;
  builtYear: number;
  constructionQuality: PropertyConstructionQuality;
  coordinates: Coordinates;
  cubature: Nullable<number>;
  garageCount: Nullable<number>;
  livingArea: number;
  microLocation: PropertyMicrolocation;
  propertyArea: number;
  propertyType: string;
  renovationYear: Nullable<number>;
  roomCount: number;
  houseType: HouseType;

  /** eDossier custom calculated field */
  imageSrcSmall: string;
  /** eDossier custom calculated field */
  imageSrcBig: string;
  /** eDossier custom calculated field */
  imageSrcOverall: string;
  /** eDossier custom calculated field */
  imageSrcSilence: string;
  /** eDossier custom calculated field */
  imageSrcView: string;
}

export interface AverageSquareMeterPrice {
  [key: string]: number;
  averagePricesPerSqrM: number;
  averageDays: number;
  quarterNumber: number;
  year: number;
}

export interface MarketStatisticsItem {
  [key: string]: AverageSquareMeterPrice[];
  area: AverageSquareMeterPrice[];
  canton: AverageSquareMeterPrice[];
  country: AverageSquareMeterPrice[];
}

export interface MarketStatistics {
  averageSquareMeterPrice: MarketStatisticsItem;
  mediumDays: MarketStatisticsItem;
  totalOffers: MarketStatisticsItem;
  transactionAmount: MarketStatisticsItem;
}

export interface PublisherStatsItem {
  count: number;
  isActive: boolean;
  publisherClass: number;
}

export interface PublisherStats {
  results: PublisherStatsItem[];
}

export interface PriceStatisticsItem {
  avgDaysOnMarket: number;
  avgPrice: number;
  avgPricePerSqrMeter: number;
  priceDecreasedPercentage: number;
  priceIncreasedPercentage: number;
  publisherStats: PublisherStats;
}

export interface PriceStatistics {
  ads: Nullable<any>;
  canton: PriceStatisticsItem;
  country: PriceStatisticsItem;
}

export interface Statistics {
  market: MarketStatistics;
  price: PriceStatistics;
  teaser: string;
}

export interface Theming {
  [key: string]: string;
  color1: string;
  color2: string;
  color3: string;
}

export interface UserLang {
  key: string;
  value: string;
}

export interface User {
  lang: UserLang;
}

export interface SimilarObject {
  price?: number;
  pricePerSqrMeter?: number;
  livingArea?: number;
  daysOnMarket?: number;
  address?: string;
  picture?: string | null;
  onMarket?: boolean;
  coordinates: Coordinates;
  rooms: number;
}

export interface Parts {
  includeOverview: boolean;
  includeImages: boolean;
  includePricePrediction: boolean;
  includeSelectedObjects: boolean;
  includeMarketSituation: boolean;
  includeMacroLocation: boolean;
  includePublicTransport: boolean;
  includeEducation: boolean;
  includeView: boolean;
  includeShopping: boolean;
  includeImmissions: boolean;
  includeConstructionSites: boolean;
}

export interface PoiInDistanceParentCategory {
  id: string;
  nameEn: string;
  nameDe: string;
  nameFr: string;
  nameIt: string;
  parentCategory: {
    id: string;
    nameEn: string;
    nameDe: string;
    nameFr: string;
    nameIt: string;
  };
}

export interface PoiInDistance {
  id: string;
  name: string;
  addressInfo: AddressInfo;
  categories: PoiInDistanceParentCategory[];
}

export interface Distance {
  area: FeatureCollection<MultiPolygon>;
  pois: PoiInDistance[];
}

export interface Distances {
  walk: Distance;
  bike: Distance;
  car: Distance;
  transportation: Distance;
}

export interface Data {
  parts: Parts;
  address: string;
  agency: Agency;
  categories: Categories;
  charts: Charts;
  commune: Commune;
  created: string;
  employee: Employee;
  images: Images;
  neighborhood: Neighborhood;
  constructionSites: ConstructionSite[];
  parcel: Parcel;
  price: Prices;
  property: Property;
  statistics: Statistics;
  theming: Theming;
  user: User;
  teaser: string;
  similarObjects: SimilarObject[];
  /**
   * 15 walking distance POIs
   */
  pins: PoiInDistance[];
  distances: Distances;
}

