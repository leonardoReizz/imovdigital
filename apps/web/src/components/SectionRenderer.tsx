import type { Section, SectionType, SearchBarSettings, Property } from '@imovdigital/types';
import { Hero } from './sections/Hero';
import { SearchBar } from './sections/SearchBar';
import { FeaturedListings } from './sections/FeaturedListings';
import { About } from './sections/About';
import { Agents } from './sections/Agents';
import { Testimonials } from './sections/Testimonials';
import { CTABanner } from './sections/CTABanner';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';

interface Props {
  sections: Section[];
  primaryColor: string;
  properties: Property[];
  cities: string[];
  tenantSlug: string;
  contactData?: any;
}

export function SectionRenderer({ sections, primaryColor, properties, cities, tenantSlug, contactData }: Props) {
  const sorted = [...sections].filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const searchBarSection = sorted.find((s) => s.type === 'search_bar');
  const searchBarSettings = searchBarSection?.settings as SearchBarSettings | undefined;

  return (
    <>
      {sorted.map((section) => {
        const s = section.settings as any;

        switch (section.type as SectionType) {
          case 'hero':
            return <Hero key={section.id} settings={s} searchBar={searchBarSettings} primaryColor={primaryColor} cities={cities} tenantSlug={tenantSlug} />;
          case 'search_bar':
            return <SearchBar key={section.id} settings={s} primaryColor={primaryColor} cities={cities} tenantSlug={tenantSlug} />;
          case 'featured_listings':
            return <FeaturedListings key={section.id} settings={s} properties={properties} primaryColor={primaryColor} />;
          case 'about':
            return <div key={section.id} id="sobre"><About settings={s} primaryColor={primaryColor} /></div>;
          case 'agents':
            return <Agents key={section.id} settings={s} />;
          case 'testimonials':
            return <Testimonials key={section.id} settings={s} />;
          case 'cta_banner':
            return <CTABanner key={section.id} settings={s} />;
          case 'contact':
            return <div key={section.id} id="contato"><Contact settings={s} primaryColor={primaryColor} tenantSlug={tenantSlug} contactData={contactData} /></div>;
          case 'footer':
            return <Footer key={section.id} settings={s} contactData={contactData} />;
          default:
            return null;
        }
      })}
    </>
  );
}
