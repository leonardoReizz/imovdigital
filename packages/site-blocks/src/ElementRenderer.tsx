import type { Element } from '@imovdigital/types';
import { TextBlock } from './elements/Text';
import { ImageBlock } from './elements/Image';
import { ButtonBlock } from './elements/Button';
import { ContainerBlock } from './elements/Container';
import { ListingsBlock } from './elements/Listings';
import { SearchBlock } from './elements/Search';
import { FormBlock } from './elements/Form';
import { DividerBlock } from './elements/Divider';
import { SpacerBlock } from './elements/Spacer';
import { VideoBlock } from './elements/Video';
import { MapBlock } from './elements/Map';
import { PropertyGalleryBlock } from './elements/PropertyGallery';
import { PropertyMapBlock } from './elements/PropertyMap';
import { PropertyContactFormBlock } from './elements/PropertyContactForm';
import { PropertyTagsBlock } from './elements/PropertyTags';
import { PropertyPricesBlock } from './elements/PropertyPrices';
import { PropertySpecsBlock } from './elements/PropertySpecs';

export function ElementRenderer({ element }: { element: Element }) {
  switch (element.type) {
    case 'text':
      return <TextBlock element={element} />;
    case 'image':
      return <ImageBlock element={element} />;
    case 'button':
      return <ButtonBlock element={element} />;
    case 'container':
      return <ContainerBlock element={element} />;
    case 'listings':
      return <ListingsBlock element={element} />;
    case 'search':
      return <SearchBlock element={element} />;
    case 'form':
      return <FormBlock element={element} />;
    case 'divider':
      return <DividerBlock element={element} />;
    case 'spacer':
      return <SpacerBlock element={element} />;
    case 'video':
      return <VideoBlock element={element} />;
    case 'map':
      return <MapBlock element={element} />;
    case 'property_gallery':
      return <PropertyGalleryBlock element={element} />;
    case 'property_map':
      return <PropertyMapBlock element={element} />;
    case 'property_contact_form':
      return <PropertyContactFormBlock element={element} />;
    case 'property_tags':
      return <PropertyTagsBlock element={element} />;
    case 'property_prices':
      return <PropertyPricesBlock element={element} />;
    case 'property_specs':
      return <PropertySpecsBlock element={element} />;
  }
}
