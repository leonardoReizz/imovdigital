import type { Section, SectionType, SearchBarSettings, Property, SiteTemplate } from '@imovdigital/types';
import { getTemplate } from '@/templates';

interface Props {
  sections: Section[];
  primaryColor: string;
  properties: Property[];
  cities: string[];
  tenantSlug: string;
  contactData?: any;
  template?: SiteTemplate | null;
}

export function SectionRenderer({ sections, primaryColor, properties, cities, tenantSlug, contactData, template }: Props) {
  const sorted = [...sections].filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const searchBarSection = sorted.find((s) => s.type === 'search_bar');
  const searchBarSettings = searchBarSection?.settings as SearchBarSettings | undefined;
  const T = getTemplate(template);

  return (
    <>
      {sorted.map((section) => {
        const s = section.settings as any;

        switch (section.type as SectionType) {
          case 'hero':
            return <T.Hero key={section.id} settings={s} searchBar={searchBarSettings} primaryColor={primaryColor} cities={cities} tenantSlug={tenantSlug} />;
          case 'search_bar':
            return <T.SearchBar key={section.id} settings={s} primaryColor={primaryColor} cities={cities} tenantSlug={tenantSlug} />;
          case 'featured_listings':
            return <T.FeaturedListings key={section.id} settings={s} properties={properties} primaryColor={primaryColor} />;
          case 'about':
            return <div key={section.id} id="sobre"><T.About settings={s} primaryColor={primaryColor} /></div>;
          case 'agents':
            return <T.Agents key={section.id} settings={s} />;
          case 'testimonials':
            return <T.Testimonials key={section.id} settings={s} />;
          case 'cta_banner':
            return <T.CTABanner key={section.id} settings={s} />;
          case 'contact':
            return <div key={section.id} id="contato"><T.Contact settings={s} primaryColor={primaryColor} tenantSlug={tenantSlug} contactData={contactData} /></div>;
          case 'footer':
            return <T.Footer key={section.id} settings={s} contactData={contactData} />;
          default:
            return null;
        }
      })}
    </>
  );
}
