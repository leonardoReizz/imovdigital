import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  PenTool,
  Globe,
  Phone,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Lock,
  ChevronDown,
  User,
  Plus,
  Check,
  Headphones,
  Menu,
  X,
  FileText,
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SupportWidget } from '../components/SupportWidget';
import logoImg from '../assets/logo.png';
import { api } from '../lib/api';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
  lockedKey?: 'leads' | 'team';
  children?: { to: string; label: string }[];
}

interface TenantOption {
  id: string;
  name: string;
  slug: string;
  role: string;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard, end: true },
  { to: '/dashboard/properties', label: 'Imóveis', icon: Building2 },
  { to: '/dashboard/leads', label: 'Leads', icon: MessageSquare, lockedKey: 'leads', children: [
    { to: '/dashboard/leads', label: 'Todos os leads' },
    { to: '/dashboard/leads/settings', label: 'Configurações' },
  ] },
  { to: '/dashboard/editor', label: 'Editor do Site', icon: PenTool },
  { to: '/dashboard/domain', label: 'Domínio', icon: Globe },
  { to: '/dashboard/contact', label: 'Contato', icon: Phone },
  { to: '/dashboard/team', label: 'Equipe', icon: Users, lockedKey: 'team' },
  { to: '/dashboard/subscription', label: 'Assinatura', icon: CreditCard },
  { to: '/dashboard/organization', label: 'Organização', icon: Settings },
];

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { limits, isTrial, trialDaysLeft, trialExpired, isBlocked } = useSubscription();

  // Block: redirect to subscription page if trial expired or canceled
  useEffect(() => {
    if (isBlocked && location.pathname !== '/dashboard/subscription') {
      navigate('/dashboard/subscription', { replace: true });
    }
  }, [isBlocked, location.pathname, navigate]);

  // Check 2FA: if token has tfv=false, verify with API if 2FA is still required
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const payload = parseJwt(token);
    if (payload && payload.tfv === false) {
      // Check if tenant still has 2FA enabled before redirecting
      api.get('/auth/me').then(({ data }: any) => {
        if (data.tenant?.twoFactorEnabled) {
          navigate('/two-factor', { replace: true });
        }
      }).catch(() => {});
    }
  }, []);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [currentTenant, setCurrentTenant] = useState<TenantOption | null>(null);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);
  const [showNewTenant, setShowNewTenant] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [creatingTenant, setCreatingTenant] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedNav, setExpandedNav] = useState<string | null>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const tenantMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      api.get('/auth/me'),
      api.get('/auth/tenants'),
    ]).then(([meRes, tenantsRes]) => {
      // Redirect to no-organization page if user has no tenants
      if (!tenantsRes.data || tenantsRes.data.length === 0) {
        navigate('/no-organization', { replace: true });
        return;
      }
      setUserName(meRes.data.name);
      setUserEmail(meRes.data.email);
      setCurrentTenant({
        id: meRes.data.tenant.id,
        name: meRes.data.tenant.name,
        slug: meRes.data.tenant.slug,
        role: meRes.data.role,
      });
      setTenants(tenantsRes.data);
    }).catch(() => {});
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (tenantMenuRef.current && !tenantMenuRef.current.contains(e.target as Node)) { setTenantMenuOpen(false); setShowNewTenant(false); }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSwitchTenant = async (tenantId: string) => {
    try {
      const { data } = await api.post('/auth/switch-tenant', { tenantId });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setTenantMenuOpen(false);
      window.location.reload();
    } catch {
      // ignore
    }
  };

  const handleCreateTenant = async () => {
    if (!newTenantName.trim()) return;
    setCreatingTenant(true);
    try {
      const { data } = await api.post('/auth/create-tenant', { agencyName: newTenantName });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setShowNewTenant(false);
      setNewTenantName('');
      window.location.reload();
    } catch {
      // ignore
    } finally {
      setCreatingTenant(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  const isLocked = (item: NavItem) => {
    if (!item.lockedKey) return false;
    return !limits[item.lockedKey];
  };

  const initials = userName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

  /* ── Sidebar content (shared between desktop and mobile drawer) ── */
  const sidebarContent = (
    <>
      {/* Logo + Tenant switcher */}
      <div className="border-b border-gray-200" ref={tenantMenuRef}>
        <div className="px-5 pt-5 pb-0">
          <img src={logoImg} alt="ImovDigital" className="h-14 object-contain" />
        </div>
        <div className="px-3 pb-3 relative">
          <button
            onClick={() => setTenantMenuOpen(!tenantMenuOpen)}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{currentTenant?.name || 'Carregando...'}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${tenantMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {tenantMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {tenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => t.id === currentTenant?.id ? setTenantMenuOpen(false) : handleSwitchTenant(t.id)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-gray-900 truncate">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.slug}</p>
                  </div>
                  {t.id === currentTenant?.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              ))}

              <div className="border-t border-gray-100">
                {showNewTenant ? (
                  <div className="p-3 space-y-2">
                    <input
                      value={newTenantName}
                      onChange={(e) => setNewTenantName(e.target.value)}
                      placeholder="Nome da imobiliária"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateTenant()}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowNewTenant(false); setNewTenantName(''); }}
                        className="flex-1 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateTenant}
                        disabled={creatingTenant || !newTenantName.trim()}
                        className="flex-1 py-1.5 text-xs font-medium text-white bg-primary rounded-lg disabled:opacity-50"
                      >
                        {creatingTenant ? 'Criando...' : 'Criar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewTenant(true)}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Nova imobiliária
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trial banner */}
      {isTrial && (
        <div className={`mx-4 mt-4 px-3 py-2 rounded-lg text-xs font-medium ${
          trialExpired
            ? 'bg-red-50 text-red-700 border border-red-200'
            : trialDaysLeft <= 2
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-primary/10 text-primary border border-primary/30'
        }`}>
          {trialExpired
            ? 'Teste expirado'
            : `Teste grátis — ${trialDaysLeft} ${trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}`}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const locked = isLocked(item);
          const hasChildren = item.children && item.children.length > 0;
          const isParentActive = location.pathname.startsWith(item.to);

          if (hasChildren) {
            const isExpanded = expandedNav === item.to || isParentActive;
            return (
              <div key={item.to}>
                <button
                  onClick={() => {
                    if (locked) return;
                    setExpandedNav(isExpanded ? null : item.to);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
                    isParentActive
                      ? 'bg-primary/10 text-primary'
                      : locked
                        ? 'text-gray-400 hover:bg-gray-50'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {locked && <Lock className="w-3.5 h-3.5 text-gray-300" />}
                  {!locked && (
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  )}
                </button>
                {isExpanded && !locked && (
                  <div className="ml-8 mt-1 space-y-0.5">
                    {item.children!.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        end
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                            isActive
                              ? 'text-primary bg-primary/5'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : locked
                      ? 'text-gray-400 hover:bg-gray-50'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {locked && <Lock className="w-3.5 h-3.5 text-gray-300" />}
            </NavLink>
          );
        })}
      </nav>

      {/* User nav */}
      <div className="p-4 border-t border-gray-200" ref={userMenuRef}>
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {initials || <User className="w-4 h-4" />}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userName || 'Carregando...'}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
              <button
                onClick={() => { navigate('/dashboard/settings'); setUserMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Configurações
              </button>
              <a
                href={`https://wa.me/${import.meta.env.VITE_SUPPORT_WHATSAPP || '5500000000000'}?text=${encodeURIComponent('Olá! Preciso de ajuda com o ImovDigital.')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Headphones className="w-4 h-4" />
                Suporte
              </a>
              <a
                href="/terms"
                target="_blank"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Termos de uso
              </a>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 z-10"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src={logoImg} alt="ImovDigital" className="h-8 object-contain" />
          <div className="w-9" /> {/* spacer for centering */}
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-4 sm:p-6 lg:p-8 pb-20"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <SupportWidget />
    </div>
  );
}
