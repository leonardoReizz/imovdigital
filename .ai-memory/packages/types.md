# Packages/types Module

## Files (13)
- packages/types/src/auth.ts
- packages/types/src/contact.ts
- packages/types/src/enums.ts
- packages/types/src/index.ts
- packages/types/src/lead.ts
- packages/types/src/page.ts
- packages/types/src/plan.ts
- packages/types/src/property.ts
- packages/types/src/templates.ts
- packages/types/src/tenant.ts
- packages/types/src/theme-presets.ts
- packages/types/src/theme.ts
- packages/types/src/user.ts

## Exports

### Functions
- `createDefaultSection(type: SectionType, id: string): Section`
- `createDefaultPage(tenantId: string, pageId: string, sectionId: string, slug: string): Page`
- `isReservedSlug(slug: string): boolean`
- `buildDefaultTemplate(slug: "search" | "home" | "property", theme: ThemeTokens): PageData`

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
- `interface GridConfig { cols: number; gap: number; direction: "row" | "column" | undefined; justifyContent: "start" | "center" | "end" | "between" | "around" | undefined; alignItems: "start" | "center" | "end" | "stretch" | undefined }`
- `interface SectionStyle { backgroundColor: string | undefined; backgroundImage: string | undefined; backgroundOverlay: { color: string; opacity: number; } | undefined; paddingTop: number | undefined; paddingBottom: number | undefined; paddingX: number | undefined }`
- `interface ElementPosition { x: number; y: number }`
- `interface ElementSize { w: number | "auto" | "full"; h: number | "auto" }`
- `interface ElementStyle { color: string | undefined; backgroundColor: string | undefined; borderRadius: number | undefined; borderWidth: number | undefined; borderColor: string | undefined; paddingTop: number | undefined }`
- `interface ThemeTokens { primaryColor: string; secondaryColor: string; fontFamily: string; headingFontFamily: string | undefined; fontSize: number; borderRadius: number }`
- `interface ResponsiveElementOverride { position: ElementPosition | undefined; size: ElementSize | undefined; style: ElementStyle | undefined }`
- `interface TextElement { content: string; tag: "h1" | "h2" | "h3" | "h4" | "p" | "span"; binding: PropertyBinding | null | undefined }`
- `interface ImageElement { src: string | null; alt: string; objectFit: "cover" | "contain" | "fill"; href: string | undefined }`
- `interface ButtonElement { label: string; url: string; variant: "primary" | "secondary" | "outline" | "ghost"; openInNewTab: boolean | undefined }`
- `interface ContainerElement { layout: SectionLayout; gridConfig: GridConfig | undefined; children: Element[] }`
- `interface ListingsElement { source: "featured" | "filter" | "manual"; filter: { type?: string | undefined; listingType?: "SALE" | "RENT" | "BOTH" | undefined; city?: string | ...; manualIds: string[] | undefined; count: number; display: "grid" | "carousel" | "list"; columns: 1 | 2 | 3 | 4 }`
- `interface SearchElement { fields: ("bedrooms" | "bathrooms" | "neighborhood" | "city" | "type" | "operation" | "priceRange" | "park...; layout: "compact" | "row" | "stacked" | "sidebar"; submitMode: "redirect" | "inline"; submitLabel: string }`
- `interface FormField { id: string; type: "text" | "email" | "phone" | "textarea" | "select"; label: string; placeholder: string | undefined; required: boolean; options: string[] | undefined }`
- `interface FormElement { fields: FormField[]; submitLabel: string; destination: "email" | "whatsapp" | "both"; successMessage: string }`
- `interface DividerElement { thickness: number; color: string; lineStyle: "solid" | "dashed" | "dotted" }`
- `interface SpacerElement { height: number }`
- `interface VideoElement { src: string; provider: "youtube" | "vimeo" | "upload"; autoplay: boolean | undefined; loop: boolean | undefined; controls: boolean | undefined; muted: boolean | undefined }`
- `interface MapElement { latitude: number; longitude: number; zoom: number; radius: number | undefined; markerLabel: string | undefined }`
- `interface PropertyGalleryElement { layout: "grid" | "carousel" | "single"; columns: 2 | 3 | 4; aspectRatio: "4:3" | "16:9" | "1:1" }`
- `interface PropertyMapElement { zoom: number; approximateOnly: boolean }`
- `interface PropertyContactFormElement { title: string; submitLabel: string; showPhoneField: boolean; showEmailField: boolean; messagePlaceholder: string }`
- `interface PropertyTagsElement { layout: "grid" | "chips"; columns: 2 | 3; showIcons: boolean }`
- `interface PropertyPricesElement { showCondo: boolean; showIptu: boolean; showTotal: boolean; title: string }`
- `interface PropertySpecsElement { layout: "grid" | "row"; items: ("area" | "bedrooms" | "bathrooms" | "parkingSpots" | "suites")[] }`
- `interface ResponsiveSectionOverride { style: SectionStyle | undefined; gridConfig: GridConfig | undefined; hidden: boolean | undefined }`
- `interface Section { id: string; type: SectionType; layout: SectionLayout; style: SectionStyle; gridConfig: GridConfig | undefined; children: Element[] }`
- `interface PageSeo { title: string; description: string; ogImage: string | undefined }`
- `interface Page { id: string; tenantId: string; slug: string; title: string; seo: PageSeo; theme: ThemeTokens }`
- `interface Plan { id: string; name: string; slug: string; monthlyPrice: number; propertyLimit: number; userLimit: number }`
- `interface PropertyImage { url: string; order: number; alt: string }`
- `interface Property { id: string; tenantId: string; title: string; description: string; slug: string; type: PropertyType }`
- `interface CreatePropertyDto { title: string; description: string; type: PropertyType; listingType: ListingType; price: number; rentPrice: number | undefined }`
- `interface PropertyFilters { q: string | undefined; type: PropertyType | undefined; listingType: ListingType | undefined; neighborhood: string | undefined; minPrice: number | undefined; maxPrice: number | undefined }`
- `interface PaginatedList { data: T[]; total: number; page: number; limit: number; totalPages: number }`
- `interface Tenant { id: string; name: string; slug: string; customDomain: string | null; logoUrl: string | null; bannerUrl: string | null }`
- `interface CreateTenantDto { name: string; slug: string; planId: string }`
- `interface UpdateTenantDto { name: string | undefined; logoUrl: string | undefined; bannerUrl: string | undefined; primaryColor: string | undefined; secondaryColor: string | undefined; fontFamily: string | undefined }`
- `interface PublicTenant { name: string; slug: string; logoUrl: string | null; bannerUrl: string | null; primaryColor: string; secondaryColor: string }`
- `interface ThemeColors { primary: string; secondary: string; accent: string; background: string; surface: string; text: string }`
- `interface ThemeTypography { headingFont: string; bodyFont: string; baseFontSize: "sm" | "base" | "lg" }`
- `interface ThemeHeader { style: "solid" | "transparent" | "gradient"; position: "top" | "left"; showSearch: boolean }`
- `interface ThemeHero { style: "compact" | "fullscreen" | "half" | "none"; overlayOpacity: number; showSearchBar: boolean; searchBarPosition: "center" | "bottom"; title: string; subtitle: string }`
- `interface ThemePropertyCard { style: "standard" | "minimal" | "detailed"; imageAspect: "4:3" | "16:9" | "1:1"; showPrice: boolean; showAddress: boolean; showFeatures: boolean; borderRadius: "sm" | "lg" | "none" | "md" | "xl" }`
- `interface ThemePropertyGrid { layout: "grid" | "list" | "masonry"; columns: 2 | 3 | 4; gap: "sm" | "lg" | "md" }`
- `interface ThemeFilters { position: "sidebar" | "top" | "modal"; showPropertyType: boolean; showListingType: boolean; showPriceRange: boolean; showBedrooms: boolean; showNeighborhood: boolean }`
- `interface ThemePropertyDetail { galleryStyle: "grid" | "carousel" | "fullwidth"; showMap: boolean; showContactForm: boolean; showWhatsapp: boolean; showRelated: boolean }`
- `interface ThemeFooter { style: "detailed" | "simple"; showSocial: boolean; copyrightText: string }`
- `interface SiteTheme { templateId: string; colors: ThemeColors; typography: ThemeTypography; header: ThemeHeader; hero: ThemeHero; propertyCard: ThemePropertyCard }`
- `interface TemplatePreset { id: string; name: string; description: string; thumbnail: string; theme: SiteTheme }`
- `interface User { id: string; tenantId: string; email: string; name: string; avatarUrl: string | null; phone: string | null }`
- `interface CreateUserDto { email: string; password: string; name: string; phone: string | undefined; role: UserRole }`
- `interface UpdateUserDto { name: string | undefined; phone: string | undefined; avatarUrl: string | undefined; role: UserRole | undefined }`

### Types
- `type Breakpoint = Breakpoint`
- `type SectionLayout = SectionLayout`
- `type ElementType = ElementType`
- `type PropertyBinding = PropertyBinding`
- `type Element = Element`
- `type SectionType = SectionType`
- `type PageStatus = PageStatus`
- `type PageData = PageData`
- `type ReservedSlug = "search" | "home" | "property"`

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
- `PROPERTY_BINDING_LABELS: Record<PropertyBinding, string>`
- `SECTION_LABELS: Record<SectionType, string>`
- `ELEMENT_LABELS: Record<ElementType, string>`
- `DEFAULT_THEME: ThemeTokens`
- `DEFAULT_SEO: PageSeo`
- `RESERVED_SLUGS: readonly ["home", "property", "search"]`
- `RESERVED_TITLES: Record<"search" | "home" | "property", string>`
- `RESERVED_DESCRIPTIONS: Record<"search" | "home" | "property", string>`
- `THEME_MODERNO: SiteTheme`
- `THEME_CLASSICO: SiteTheme`
- `TEMPLATE_PRESETS: TemplatePreset[]`

---
_Auto-generated by code-memory_
