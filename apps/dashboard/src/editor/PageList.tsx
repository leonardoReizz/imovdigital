import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus, FileText, CheckCircle2, Lock, Home, Building2, Search as SearchIcon } from 'lucide-react';
import { listPages, createPage, deletePage, type PageListItem } from './api';

const RESERVED_LABELS: Record<string, { label: string; icon: typeof FileText }> = {
  home: { label: 'Página inicial', icon: Home },
  property: { label: 'Detalhe do imóvel', icon: Building2 },
  search: { label: 'Busca de imóveis', icon: SearchIcon },
};

const RESERVED_HINTS: Record<string, string> = {
  home: 'Página principal do site (URL: /).',
  property: 'Layout usado por todas as páginas de imóvel (/imoveis/:slug).',
  search: 'Layout da página de busca e listagem (/imoveis).',
};

export function PageList() {
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ slug: '', title: '' });
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const data = await listPages();
      setPages(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (creating) return;
    setCreating(true);
    try {
      await createPage(form.slug, form.title);
      setShowForm(false);
      setForm({ slug: '', title: '' });
      await refresh();
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, slug: string) {
    if (!confirm(`Remover a página "${slug}"? Essa ação não pode ser desfeita.`)) return;
    setRemovingId(id);
    try {
      await deletePage(id);
      await refresh();
    } finally {
      setRemovingId(null);
    }
  }

  const reserved = pages.filter((p) => p.reserved);
  const custom = pages.filter((p) => !p.reserved);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Editor do site</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure as páginas padrão e crie páginas de campanha.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-md text-sm hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Nova página
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-4 border border-slate-200 rounded-lg bg-white space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Título</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Campanha de lançamento"
              required
              className="w-full h-9 px-2 text-sm border border-slate-200 rounded-md focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Slug (URL)</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              placeholder="campanha-lancamento"
              required
              pattern="^[a-z0-9][a-z0-9-]*$"
              className="w-full h-9 px-2 text-sm border border-slate-200 rounded-md focus:border-blue-400 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Slugs reservados: <code>home</code>, <code>property</code>, <code>search</code>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={creating}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {creating ? 'Criando…' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-sm hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Default pages */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-2 px-1">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Páginas padrão
          </h2>
          <Lock className="w-3 h-3 text-slate-400" />
        </div>
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Carregando…</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {reserved.map((p) => {
                const meta = RESERVED_LABELS[p.slug] ?? { label: p.title, icon: FileText };
                const Icon = meta.icon;
                return (
                  <li key={p.id}>
                    <Link
                      to={`/dashboard/pages/${p.id}/editor`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {meta.label}
                          </p>
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                            Padrão
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {RESERVED_HINTS[p.slug] ?? p.slug}
                        </p>
                      </div>
                      {p.status === 'published' ? (
                        <span className="flex items-center gap-1 text-[11px] text-green-700 bg-green-100 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          Publicada
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Rascunho
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Custom pages */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-1">
          Páginas de campanha
        </h2>
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Carregando…</div>
          ) : custom.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              Nenhuma página de campanha ainda. Use o botão "Nova página" pra criar.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {custom.map((p) => (
                <li key={p.id} className="flex items-center">
                  <Link
                    to={`/dashboard/pages/${p.id}/editor`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 flex-1"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{p.title}</p>
                      <p className="text-xs text-slate-500">/{p.slug}</p>
                    </div>
                    {p.status === 'published' ? (
                      <span className="flex items-center gap-1 text-[11px] text-green-700 bg-green-100 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        Publicada
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Rascunho
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.slug)}
                    disabled={removingId === p.id}
                    className="px-3 py-3 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
