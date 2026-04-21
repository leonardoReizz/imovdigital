export { BlocksProvider, useBlocks, useIsEditMode } from './context';
export type { BlocksContextValue, WrapElementContext } from './context';

export { SectionRenderer } from './SectionRenderer';
export { SectionBody } from './SectionBody';
export { ElementRenderer } from './ElementRenderer';

export {
  elementStyleToCss,
  sectionStyleToCss,
  resolveSection,
  resolveElement,
  isElementHidden,
} from './utils/style';

export { PropertyCard } from './PropertyCard';
export type { PropertyCardTemplate } from './PropertyCard';

export { buildMockProperties, MOCK_CITIES_LIST, MOCK_NEIGHBORHOODS_LIST } from './mocks';
