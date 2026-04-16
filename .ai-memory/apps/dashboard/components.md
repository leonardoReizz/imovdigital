# Apps/dashboard/components Module

## Files (38)
- apps/dashboard/src/components/CancellationModal.tsx
- apps/dashboard/src/components/GoogleAddressInput.tsx
- apps/dashboard/src/components/ImageUploader.tsx
- apps/dashboard/src/components/Img.tsx
- apps/dashboard/src/components/PhoneInput.tsx
- apps/dashboard/src/components/SupportWidget.tsx
- apps/dashboard/src/components/UpgradeWall.tsx
- apps/dashboard/src/components/editor/GlobalSettings.tsx
- apps/dashboard/src/components/editor/PropertyDetailSettings.tsx
- apps/dashboard/src/components/editor/SearchPageSettings.tsx
- apps/dashboard/src/components/editor/SectionSettings.tsx
- apps/dashboard/src/components/editor/SectionsList.tsx
- apps/dashboard/src/components/editor/SitePreview.tsx
- apps/dashboard/src/components/editor/controls/BadgeToggle.tsx
- apps/dashboard/src/components/editor/controls/ColorPicker.tsx
- apps/dashboard/src/components/editor/controls/EditorImageUploader.tsx
- apps/dashboard/src/components/editor/controls/FontSelector.tsx
- apps/dashboard/src/components/editor/controls/RangeSlider.tsx
- apps/dashboard/src/components/editor/controls/SelectField.tsx
- apps/dashboard/src/components/editor/controls/TextInput.tsx
- apps/dashboard/src/components/editor/controls/TextareaField.tsx
- apps/dashboard/src/components/editor/controls/ToggleGroup.tsx
- apps/dashboard/src/components/editor/controls/index.ts
- apps/dashboard/src/components/editor/preview/AboutPreview.tsx
- apps/dashboard/src/components/editor/preview/AgentsPreview.tsx
- apps/dashboard/src/components/editor/preview/CTABannerPreview.tsx
- apps/dashboard/src/components/editor/preview/ContactPreview.tsx
- apps/dashboard/src/components/editor/preview/FeaturedListingsPreview.tsx
- apps/dashboard/src/components/editor/preview/FooterPreview.tsx
- apps/dashboard/src/components/editor/preview/HeroPreview.tsx
- apps/dashboard/src/components/editor/preview/ImageLightbox.tsx
- apps/dashboard/src/components/editor/preview/MapCircle.tsx
- apps/dashboard/src/components/editor/preview/PreviewHeader.tsx
- apps/dashboard/src/components/editor/preview/PropertyDetailPreview.tsx
- apps/dashboard/src/components/editor/preview/PropertyPrice.tsx
- apps/dashboard/src/components/editor/preview/SearchBarPreview.tsx
- apps/dashboard/src/components/editor/preview/SearchResultsPreview.tsx
- apps/dashboard/src/components/editor/preview/TestimonialsPreview.tsx

## Exports

### Functions
- `CancellationModal({ onClose, onCanceled }: { onClose: () => void; onCanceled: () => void; }): React.JSX.Element`
- `GoogleAddressInput({ onSelect }: GoogleAddressInputProps): React.JSX.Element`
- `ImageUploader({
  images,
  onChange,
  maxFiles = 20,
  maxSizeMB = 10,
}: ImageUploaderProps): React.JSX.Element`
- `Img(props: React.ImgHTMLAttributes<HTMLImageElement>): React.JSX.Element`
- `formatPhone(value: string): string`
- `SupportWidget(): React.JSX.Element`
- `UpgradeWall({ feature, description }: UpgradeWallProps): React.JSX.Element`
- `GlobalSettings(): React.JSX.Element | null`
- `PropertyDetailSettings(): React.JSX.Element | null`
- `SearchPageSettings(): React.JSX.Element | null`
- `SectionSettings(): React.JSX.Element | null`
- `SectionsList(): React.JSX.Element | null`
- `SitePreview(): React.JSX.Element`
- `BadgeToggle({ label, value, onChange }: BadgeToggleProps): React.JSX.Element`
- `ColorPicker({ label, value, onChange }: ColorPickerProps): React.JSX.Element`
- `EditorImageUploader({
  label,
  value,
  onChange,
  folder = 'gallery',
  aspectRatio,
}: EditorImageUploaderProps): React.JSX.Element`
- `FontSelector({ label, value, onChange }: FontSelectorProps): React.JSX.Element`
- `RangeSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = '',
}: RangeSliderProps): React.JSX.Element`
- `SelectField({ label, value, onChange, options }: SelectFieldProps): React.JSX.Element`
- `TextInput({ label, value, onChange, placeholder }: TextInputProps): React.JSX.Element`
- `TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: TextareaFieldProps): React.JSX.Element`
- `ToggleGroup({ label, value, onChange, options }: ToggleGroupProps): React.JSX.Element`
- `AboutPreview({ settings }: { settings: AboutSettings; }): React.JSX.Element`
- `AgentsPreview({ settings }: { settings: AgentsSettings; }): React.JSX.Element`
- `CTABannerPreview({ settings }: { settings: CTABannerSettings; }): React.JSX.Element`
- `ContactPreview({ settings }: { settings: ContactSettings; }): React.JSX.Element`
- `FeaturedListingsPreview({ settings }: { settings: FeaturedListingsSettings; }): React.JSX.Element`
- `FooterPreview({ settings }: { settings: FooterSettings; }): React.JSX.Element`
- `HeroPreview({ settings }: { settings: HeroSettings; }): React.JSX.Element`
- `ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps): React.JSX.Element`
- `MapCircle({ latitude, longitude, radius, primaryColor }: MapCircleProps): React.JSX.Element`
- `PreviewHeader(): React.JSX.Element`
- `PropertyDetailPreview({ property }: { property: Property; }): React.JSX.Element`
- `PropertyPrice({ price, rentPrice, listingType, size = 'sm', primaryColor = '#2563eb' }: PropertyPriceProps): React.JSX.Element`
- `SearchBarPreview({ settings, embedded }: SearchBarPreviewProps): React.JSX.Element | null`
- `SearchResultsPreview(): React.JSX.Element`
- `TestimonialsPreview({ settings }: { settings: TestimonialsSettings; }): React.JSX.Element`

### Interfaces
- `interface AddressData { fullAddress: string; street: string; number: string; neighborhood: string; city: string; state: string }`
- `interface ImageFile { id: string; file: File; preview: string; alt: string }`

### Variables
- `PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps & React.RefAttributes<HTMLInputElement>>`

## Internal dependencies
- → apps/dashboard
- → apps/dashboard/store
- → apps/dashboard/hooks

## External dependencies
`react`, `motion`, `lucide-react`, `react-router`, `@imovdigital/types`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@imovdigital/utils`

---
_Auto-generated by code-memory_
