import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  label: string;
}

interface Group {
  title: string;
  items: Shortcut[];
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl';

const GROUPS: Group[] = [
  {
    title: 'Navegação',
    items: [
      { keys: ['Espaço', '+ arrastar'], label: 'Mover o canvas' },
      { keys: [`${MOD}`, '+', '='], label: 'Zoom in' },
      { keys: [`${MOD}`, '+', '-'], label: 'Zoom out' },
      { keys: [`${MOD}`, '+', '0'], label: 'Zoom 100%' },
      { keys: [`${MOD}`, '+ scroll'], label: 'Zoom pelo mouse' },
    ],
  },
  {
    title: 'Painéis',
    items: [
      { keys: [`${MOD}`, '+', ','], label: 'Alternar painel esquerdo' },
      { keys: [`${MOD}`, '+', '.'], label: 'Alternar painel direito' },
    ],
  },
  {
    title: 'Edição',
    items: [
      { keys: ['Esc'], label: 'Desselecionar' },
      { keys: ['Delete'], label: 'Remover seleção' },
      { keys: [`${MOD}`, '+', 'D'], label: 'Duplicar seleção' },
      { keys: [`${MOD}`, '+', 'C'], label: 'Copiar seleção' },
      { keys: [`${MOD}`, '+', 'V'], label: 'Colar' },
      { keys: [`${MOD}`, '+', 'Z'], label: 'Desfazer' },
      { keys: [`${MOD}`, '+', '⇧', '+', 'Z'], label: 'Refazer' },
      { keys: ['Duplo clique'], label: 'Editar texto inline' },
    ],
  },
  {
    title: 'Arrastar',
    items: [
      { keys: ['Alt'], label: 'Desativa snap durante drag' },
      { keys: ['Shift'], label: 'Libera proporção ao redimensionar imagem' },
    ],
  },
  {
    title: 'Ajuda',
    items: [{ keys: [`${MOD}`, '+', '/'], label: 'Mostrar este menu' }],
  },
];

export function ShortcutsModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Atalhos de teclado</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {group.title}
              </h3>
              <ul className="space-y-1.5">
                {group.items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, j) =>
                        k === '+' ? (
                          <span key={j} className="text-slate-400 text-xs mx-0.5">+</span>
                        ) : (
                          <kbd
                            key={j}
                            className="px-1.5 py-0.5 border border-slate-200 rounded text-[11px] font-medium text-slate-600 bg-slate-50 shadow-[0_1px_0_0_rgb(0_0_0/0.04)]"
                          >
                            {k}
                          </kbd>
                        ),
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
