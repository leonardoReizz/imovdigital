import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Image,
  Search,
  LayoutGrid,
  Info,
  Users,
  MessageSquare,
  Megaphone,
  Phone,
  Columns3,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type { SectionType, Section } from '@imovdigital/types';
import { SECTION_LABELS } from '@imovdigital/types';

const SECTION_ICONS: Record<SectionType, React.ReactNode> = {
  hero: <Image className="w-4 h-4" />,
  search_bar: <Search className="w-4 h-4" />,
  featured_listings: <LayoutGrid className="w-4 h-4" />,
  about: <Info className="w-4 h-4" />,
  agents: <Users className="w-4 h-4" />,
  testimonials: <MessageSquare className="w-4 h-4" />,
  cta_banner: <Megaphone className="w-4 h-4" />,
  contact: <Phone className="w-4 h-4" />,
  footer: <Columns3 className="w-4 h-4" />,
};

// Sections that can appear multiple times
const REPEATABLE_SECTIONS: SectionType[] = ['cta_banner'];

const ALL_SECTION_TYPES: SectionType[] = [
  'hero', 'search_bar', 'featured_listings', 'about',
  'agents', 'testimonials', 'cta_banner', 'contact', 'footer',
];

// ─── Sortable Item ───────────────────────────────────────────

function SortableSection({ section }: { section: Section }) {
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectSection = useEditorStore((s) => s.selectSection);
  const toggleVisibility = useEditorStore((s) => s.toggleSectionVisibility);
  const removeSection = useEditorStore((s) => s.removeSection);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = selectedSectionId === section.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-primary-light border border-primary/30'
          : 'hover:bg-gray-50 border border-transparent'
      } ${!section.visible ? 'opacity-50' : ''}`}
      onClick={() => selectSection(section.id)}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <span className="text-gray-400">{SECTION_ICONS[section.type]}</span>
      <span className="flex-1 text-sm text-gray-700 truncate">
        {SECTION_LABELS[section.type]}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleVisibility(section.id);
        }}
        className="p-1 text-gray-300 hover:text-gray-500 transition-colors"
      >
        {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          removeSection(section.id);
        }}
        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Add Section Modal ───────────────────────────────────────

function AddSectionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const config = useEditorStore((s) => s.config);
  const addSection = useEditorStore((s) => s.addSection);

  if (!config) return null;

  const existingTypes = new Set(config.sections.map((s) => s.type));
  const available = ALL_SECTION_TYPES.filter(
    (type) => !existingTypes.has(type) || REPEATABLE_SECTIONS.includes(type),
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary hover:bg-primary-light rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Adicionar seção
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {available.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">
                Todas as seções já foram adicionadas
              </p>
            ) : (
              available.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    addSection(type);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-400">{SECTION_ICONS[type]}</span>
                  {SECTION_LABELS[type]}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main List ───────────────────────────────────────────────

export function SectionsList() {
  const config = useEditorStore((s) => s.config);
  const reorderSections = useEditorStore((s) => s.reorderSections);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!config) return null;

  const sorted = [...config.sections].sort((a, b) => a.order - b.order);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((s) => s.id === active.id);
    const newIndex = sorted.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newSorted = [...sorted];
    const [moved] = newSorted.splice(oldIndex, 1);
    newSorted.splice(newIndex, 0, moved);
    reorderSections(newSorted.map((s) => s.id));
  }

  return (
    <div className="space-y-1">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sorted.map((section) => (
            <SortableSection key={section.id} section={section} />
          ))}
        </SortableContext>
      </DndContext>

      <AddSectionButton />
    </div>
  );
}
