import type { SiteTemplate } from '@imovdigital/types';
import type { ComponentType } from 'react';

import { Hero as ClassicHero } from '@/components/sections/Hero';
import { SearchBar as ClassicSearchBar } from '@/components/sections/SearchBar';
import { FeaturedListings as ClassicFeatured } from '@/components/sections/FeaturedListings';
import { About as ClassicAbout } from '@/components/sections/About';
import { Agents as ClassicAgents } from '@/components/sections/Agents';
import { Testimonials as ClassicTestimonials } from '@/components/sections/Testimonials';
import { CTABanner as ClassicCTA } from '@/components/sections/CTABanner';
import { Contact as ClassicContact } from '@/components/sections/Contact';
import { Footer as ClassicFooter } from '@/components/sections/Footer';
import { SiteHeader as ClassicSiteHeader } from '@/components/SiteHeader';
import { PropertyCard as ClassicPropertyCard } from '@/components/PropertyCard';

import { PropertyDetailLayout as ClassicPropertyDetailLayout } from './classic/PropertyDetailLayout';
import { PropertyDetailLayout as EditorialPropertyDetailLayout } from './editorial/PropertyDetailLayout';

import { Hero as EditorialHero } from './editorial/sections/Hero';
import { FeaturedListings as EditorialFeatured } from './editorial/sections/FeaturedListings';
import { About as EditorialAbout } from './editorial/sections/About';
import { Agents as EditorialAgents } from './editorial/sections/Agents';
import { Testimonials as EditorialTestimonials } from './editorial/sections/Testimonials';
import { CTABanner as EditorialCTA } from './editorial/sections/CTABanner';
import { Footer as EditorialFooter } from './editorial/sections/Footer';
import { SiteHeader as EditorialSiteHeader } from './editorial/SiteHeader';
import { PropertyCard as EditorialPropertyCard } from './editorial/PropertyCard';

export interface TemplateRegistry {
  Hero: ComponentType<any>;
  SearchBar: ComponentType<any>;
  FeaturedListings: ComponentType<any>;
  About: ComponentType<any>;
  Agents: ComponentType<any>;
  Testimonials: ComponentType<any>;
  CTABanner: ComponentType<any>;
  Contact: ComponentType<any>;
  Footer: ComponentType<any>;
  SiteHeader: ComponentType<any>;
  PropertyCard: ComponentType<any>;
  PropertyDetailLayout: ComponentType<any>;
}

const TEMPLATES: Record<SiteTemplate, TemplateRegistry> = {
  classic: {
    Hero: ClassicHero,
    SearchBar: ClassicSearchBar,
    FeaturedListings: ClassicFeatured,
    About: ClassicAbout,
    Agents: ClassicAgents,
    Testimonials: ClassicTestimonials,
    CTABanner: ClassicCTA,
    Contact: ClassicContact,
    Footer: ClassicFooter,
    SiteHeader: ClassicSiteHeader,
    PropertyCard: ClassicPropertyCard,
    PropertyDetailLayout: ClassicPropertyDetailLayout,
  },
  editorial: {
    Hero: EditorialHero,
    SearchBar: ClassicSearchBar,
    FeaturedListings: EditorialFeatured,
    About: EditorialAbout,
    Agents: EditorialAgents,
    Testimonials: EditorialTestimonials,
    CTABanner: EditorialCTA,
    Contact: ClassicContact,
    Footer: EditorialFooter,
    SiteHeader: EditorialSiteHeader,
    PropertyCard: EditorialPropertyCard,
    PropertyDetailLayout: EditorialPropertyDetailLayout,
  },
};

export function getTemplate(name: SiteTemplate | undefined | null): TemplateRegistry {
  return TEMPLATES[name || 'classic'] || TEMPLATES.classic;
}
