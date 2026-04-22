# Project Rules

## Lessons

### API (Backend - NestJS)
- All API routes MUST include JWT authentication validation. Use `@UseGuards(JwtAuthGuard)` on controllers or routes. Never create unprotected endpoints unless explicitly requested.

### Frontend (Next.js / React)
- All forms MUST use `react-hook-form` with `zod` for validation. Always define a zod schema, infer the TypeScript type from it, and use `zodResolver` in `useForm()`. Never create forms with manual state management or unvalidated inputs.


# Project Memory (code-memory)

Before starting any task, read the files in `.ai-memory/` to understand the project structure.

- `.ai-memory/project-map.json` contains the full file map
- `.ai-memory/*.md` files contain module summaries with responsibilities

Always consult these files first instead of scanning the entire codebase. This saves tokens and gives you immediate context about the project architecture.


# Site Templates

Each tenant picks a `template` in their `SiteConfig` (field added to `packages/types/src/site-config.ts`). The template controls the visual/UX shell of the 3 public pages — Home (sections), Search (`/imoveis`) and Property Detail (`/imoveis/[slug]`) — plus the equivalent previews in the dashboard editor.

Existing templates: `classic` (default), `editorial`. See `docs/site-templates.md` for the design language of each and a roadmap of suggested next templates.

## To add a new template (e.g. `minimalist`)

Treat this as a 4-step checklist. Skipping any step leaves the new template visually inconsistent on at least one page or in the editor preview.

**1. Type + defaults**
- Extend the `SiteTemplate` union and the `SITE_TEMPLATES` array in `packages/types/src/site-config.ts`.
- Update the `@IsIn([...])` validator in `apps/api/src/modules/site-config/site-config.dto.ts`.
- (No DB migration needed — `SiteConfig` is stored as JSON in `siteConfig.data`. Existing rows fall back to `'classic'` via the loader in `apps/dashboard/src/store/editorStore.ts` and the page-level `siteConfig?.template || 'classic'` reads.)

**2. Public site (`apps/web`)**
- Create `apps/web/src/templates/<name>/` with one file per overridden component:
  - Sections (in `sections/`): `Hero.tsx`, `FeaturedListings.tsx`, `About.tsx`, `Agents.tsx`, `Testimonials.tsx`, `CTABanner.tsx`, `Footer.tsx`. (`SearchBar` and `Contact` typically reuse classic — they are form-heavy.)
  - Page primitives: `PropertyCard.tsx`, `SiteHeader.tsx`.
  - Page layout: `PropertyDetailLayout.tsx` (the search page does not need a separate layout file — its container styles live inline in `apps/web/src/app/imoveis/page.tsx`, gated by template).
- Wire them into the registry in `apps/web/src/templates/index.ts` (`TEMPLATES[<name>]`). Components you don't override can fall through to `Classic*` imports.
- Each component must accept the same props as its classic counterpart — the registry is typed loosely (`ComponentType<any>`) but the call sites in `SectionRenderer.tsx`, `imoveis/page.tsx` and `imoveis/[slug]/page.tsx` pass fixed prop shapes.
- For the search page, add a branch in `apps/web/src/app/imoveis/page.tsx` that styles the page chrome (heading, container width, pagination shape) for the new template.

**3. Editor preview (`apps/dashboard`)**
- Mirror the visual variants under `apps/dashboard/src/components/editor/preview/<name>/`. The previews are standalone (Vite, no Next.js), so they can't import from `apps/web` — write parallel implementations that read state via `useEditorStore`.
- Required mirrors for full coverage: `HeroPreview`, `FeaturedListingsPreview`, `AboutPreview`, `AgentsPreview`, `TestimonialsPreview`, `CTABannerPreview`, `FooterPreview`, `PreviewHeader`, `SearchResultsPreview`, `PropertyDetailPreview`. (`SearchBarPreview` and `ContactPreview` typically reuse classic.)
- Register the new component map in `PREVIEW_COMPONENTS_BY_TEMPLATE` and add the new template's `Header / SearchResults / PropertyDetail` to the dispatch block in `apps/dashboard/src/components/editor/SitePreview.tsx`.

**4. Validate**
- `pnpm --filter @imovdigital/types build` (so dependent apps see the new union value).
- `pnpm --filter dashboard lint` and `pnpm --filter api lint` (both run `tsc --noEmit`).
- Manually switch templates in the editor's Global tab and walk all 3 preview pages.

## Design rules of thumb
- Don't introduce new `SectionSettings` fields just to support a template — templates should reinterpret the same settings, not require their own schema. New fields belong in the section settings only when they are useful in *all* templates (the recent `gradientFrom/gradientTo/gradientDirection` additions are an example).
- Preserve all existing config switches (`pd.galleryStyle`, `sp.filterPosition`, `sp.layout`, `contactPosition`, etc.) — a template chooses *how* a setting renders, not *whether* it exists.
- Keep the public site components and the editor preview components visually aligned per template, otherwise users will publish a site that doesn't match what they were editing.

## Template-aware editor controls

Settings that a template can't honor (because the layout makes them meaningless) **must not appear in the editor** for that template. Don't show a control that does nothing — users will think the editor is broken.

Make the panels in `apps/dashboard/src/components/editor/SectionSettings.tsx` template-aware:

```tsx
const template = useEditorStore((s) => s.config?.template || 'classic');
const isEditorial = template === 'editorial';

// Hide a control entirely when the template ignores it:
{!isEditorial && <ToggleGroup label="Altura" ... />}

// Or restrict the option list:
const positionOptions = isEditorial
  ? [{ value: 'below_hero', ... }, { value: 'standalone', ... }]
  : [/* all 4 positions */];

// And include a one-line note explaining why a control is missing:
{isEditorial && (
  <p className="text-[11px] text-gray-400 bg-gray-50 rounded-lg p-2.5">
    O template <strong>Editorial</strong> usa layout assimétrico fixo. Altura e alinhamento são definidos pelo design.
  </p>
)}
```

When restricting an option list, also normalize the displayed value so the `<SelectField>` doesn't render blank when the stored value is no longer a valid option (e.g. data created in `classic` then opened in `editorial`):

```tsx
const positionValue = isEditorial && (s.position === 'above_hero' || s.position === 'center_hero')
  ? 'below_hero'
  : s.position;
```

The renderer side should similarly tolerate legacy values rather than crashing — the editorial `Hero` accepts any of `above_hero/center_hero/below_hero` as "embed below" so old data published in classic keeps working when the tenant switches templates.

**Audit checklist when adding a new template:** for each section, walk every control in the corresponding `*SettingsPanel` and ask "does my template visibly react to this?". If no, gate it behind `!isNewTemplate` and add a note. Examples of controls that commonly don't translate: hero `height`/`textAlign`, search bar `position`, layout toggles like `grid`/`carousel` when only one is implemented.
