# Packages/types Module

## Files (12)
- packages/types/src/auth.ts
- packages/types/src/contact.ts
- packages/types/src/enums.ts
- packages/types/src/index.ts
- packages/types/src/lead.ts
- packages/types/src/plan.ts
- packages/types/src/property.ts
- packages/types/src/site-config.ts
- packages/types/src/tenant.ts
- packages/types/src/theme-presets.ts
- packages/types/src/theme.ts
- packages/types/src/user.ts

## Exports

### Interfaces
- `interface LoginDto { email: string; password: string }`
- `interface TokensDto { accessToken: string; refreshToken: string }`
- `interface RefreshTokenDto { refreshToken: string }`
- `interface JwtPayload { sub: string; email: string; tenantId: string; role: UserRole }`
- `interface BusinessHours { mon: string; tue: string; wed: string; thu: string; fri: string; sat: string }`
- `interface ContactConfig { id: string; tenantId: string; whatsapp: string | null; whatsappMessage: string | null; phone: string | null; email: string | null }`
- `interface UpdateContactConfigDto { whatsapp: string | null | undefined; whatsappMessage: string | null | undefined; phone: string | null | undefined; email: string | null | undefined; showForm: boolean | undefined; address: string | null | undefined }`
- `interface Lead { id: string; tenantId: string; propertyId: string | null; name: string; email: string; phone: string | null }`
- `interface CreateLeadDto { name: string; email: string; phone: string | undefined; message: string | undefined; propertyId: string | undefined; source: LeadSource }`
- `interface Plan { id: string; name: string; slug: string; monthlyPrice: number; propertyLimit: number; userLimit: number }`
- `interface PropertyImage { url: string; order: number; alt: string }`
- `interface Property { id: string; tenantId: string; title: string; description: string; slug: string; type: PropertyType }`
- `interface CreatePropertyDto { title: string; description: string; type: PropertyType; listingType: ListingType; price: number; rentPrice: number | undefined }`
- `interface PropertyFilters { q: string | undefined; type: PropertyType | undefined; listingType: ListingType | undefined; neighborhood: string | undefined; minPrice: number | undefined; maxPrice: number | undefined }`
- `interface PaginatedList { data: T[]; total: number; page: number; limit: number; totalPages: number }`
- `interface HeroSettings { backgroundType: "image" | "video" | "gradient" | "color"; backgroundUrl: string | null; overlayOpacity: number; overlayColor: string; headline: string; subheadline: string }`
- `interface SearchBarSettings { position: "above_hero" | "center_hero" | "below_hero" | "standalone"; placeholder: string; fields: ("tipo" | "cidade" | "bairro" | "preco" | "quartos")[]; backgroundColor: string; borderRadius: "none" | "sm" | "md" | "lg" | "full" }`
- `interface FeaturedListingsSettings { title: string; subtitle: string; layout: "grid" | "carousel" | "list"; columns: 2 | 3 | 4; showPrice: boolean; showBadge: boolean }`
- `interface AboutSettings { title: string; text: string; imageUrl: string | null; imagePosition: "left" | "right"; showStats: boolean; stats: { label: string; value: string; }[] }`
- `interface AgentsSettings { title: string; subtitle: string; layout: "grid" | "carousel"; showContact: boolean }`
- `interface TestimonialsSettings { title: string; layout: "grid" | "carousel"; source: "manual" | "google"; googlePlaceId: string; minRating: number; items: { name: string; text: string; rating: number; avatarUrl: string | null; }[] }`
- `interface CTABannerSettings { headline: string; subheadline: string; ctaLabel: string; ctaUrl: string; backgroundType: "image" | "gradient" | "color"; backgroundValue: string }`
- `interface ContactSettings { title: string; showMap: boolean; showWhatsApp: boolean; showForm: boolean; showEmailField: boolean; showPhoneField: boolean }`
- `interface FooterSettings { logoUrl: string | null; logoSize: number; description: string; creci: string; showInstagram: boolean; showFacebook: boolean }`
- `interface SectionSettingsMap { hero: HeroSettings; search_bar: SearchBarSettings; featured_listings: FeaturedListingsSettings; about: AboutSettings; agents: AgentsSettings; testimonials: TestimonialsSettings }`
- `interface PropertyDetailConfig { galleryStyle: "grid" | "carousel" | "single"; contactPosition: "sidebar" | "bottom" | "floating"; showContactForm: boolean; chatTooltip: string; showWhatsApp: boolean; whatsAppNumber: string }`
- `interface SearchPageConfig { pagination: "paginated" | "infinite_scroll"; itemsPerPage: number; filterPosition: "sidebar" | "top"; showTypeFilter: boolean; showListingFilter: boolean; showBedroomsFilter: boolean }`
- `interface Section { id: string; type: T; order: number; visible: boolean; settings: SectionSettingsMap[T] }`
- `interface SiteConfig { id: string; tenantId: string; primaryColor: string; secondaryColor: string; fontSize: number; fontFamily: string }`
- `interface Tenant { id: string; name: string; slug: string; customDomain: string | null; logoUrl: string | null; bannerUrl: string | null }`
- `interface CreateTenantDto { name: string; slug: string; planId: string }`
- `interface UpdateTenantDto { name: string | undefined; logoUrl: string | undefined; bannerUrl: string | undefined; primaryColor: string | undefined; secondaryColor: string | undefined; fontFamily: string | undefined }`
- `interface PublicTenant { name: string; slug: string; logoUrl: string | null; bannerUrl: string | null; primaryColor: string; secondaryColor: string }`
- `interface ThemeColors { primary: string; secondary: string; accent: string; background: string; surface: string; text: string }`
- `interface ThemeTypography { headingFont: string; bodyFont: string; baseFontSize: "sm" | "lg" | "base" }`
- `interface ThemeHeader { style: "gradient" | "solid" | "transparent"; position: "left" | "top"; showSearch: boolean }`
- `interface ThemeHero { style: "none" | "fullscreen" | "half" | "compact"; overlayOpacity: number; showSearchBar: boolean; searchBarPosition: "bottom" | "center"; title: string; subtitle: string }`
- `interface ThemePropertyCard { style: "standard" | "minimal" | "detailed"; imageAspect: "16:9" | "4:3" | "1:1"; showPrice: boolean; showAddress: boolean; showFeatures: boolean; borderRadius: "none" | "sm" | "md" | "lg" | "xl" }`
- `interface ThemePropertyGrid { layout: "grid" | "list" | "masonry"; columns: 2 | 3 | 4; gap: "sm" | "md" | "lg" }`
- `interface ThemeFilters { position: "sidebar" | "top" | "modal"; showPropertyType: boolean; showListingType: boolean; showPriceRange: boolean; showBedrooms: boolean; showNeighborhood: boolean }`
- `interface ThemePropertyDetail { galleryStyle: "grid" | "carousel" | "fullwidth"; showMap: boolean; showContactForm: boolean; showWhatsapp: boolean; showRelated: boolean }`
- `interface ThemeFooter { style: "detailed" | "simple"; showSocial: boolean; copyrightText: string }`
- `interface SiteTheme { templateId: string; colors: ThemeColors; typography: ThemeTypography; header: ThemeHeader; hero: ThemeHero; propertyCard: ThemePropertyCard }`
- `interface TemplatePreset { id: string; name: string; description: string; thumbnail: string; theme: SiteTheme }`
- `interface User { id: string; tenantId: string; email: string; name: string; avatarUrl: string | null; phone: string | null }`
- `interface CreateUserDto { email: string; password: string; name: string; phone: string | undefined; role: UserRole }`
- `interface UpdateUserDto { name: string | undefined; phone: string | undefined; avatarUrl: string | undefined; role: UserRole | undefined }`

### Types
- `type SectionType = SectionType`

### Enums
- `enum PropertyType { APARTMENT, AREA, HOUSE, HOUSE_COMMERCIAL, CHACARA, COBERTURA, COMMERCIAL, CONJUNTO_COMERCIAL, GALPAO, GEMINADO, LOFT, PREDIO_COMERCIAL, SALA_COMERCIAL, SALA_CONJUNTO, SITIO, SOBRADO, LAND }`
- `enum ListingType { SALE, RENT, BOTH }`
- `enum UserRole { OWNER, ADMIN, AGENT }`
- `enum SubscriptionStatus { ACTIVE, TRIAL, OVERDUE, CANCELED }`
- `enum LayoutStyle { GRID, LIST, MAP }`
- `enum LeadSource { FORM, WHATSAPP, PHONE }`
- `enum PropertySort { PRICE_ASC, PRICE_DESC, NEWEST, FEATURED }`

### Variables
- `PROPERTY_TYPE_LABELS: Record<string, string>`
- `DEFAULT_PROPERTY_DETAIL_CONFIG: PropertyDetailConfig`
- `DEFAULT_SEARCH_PAGE_CONFIG: SearchPageConfig`
- `SECTION_LABELS: Record<SectionType, string>`
- `DEFAULT_SECTION_SETTINGS: SectionSettingsMap`
- `THEME_MODERNO: SiteTheme`
- `THEME_CLASSICO: SiteTheme`
- `TEMPLATE_PRESETS: TemplatePreset[]`

---
_Auto-generated by code-memory_
