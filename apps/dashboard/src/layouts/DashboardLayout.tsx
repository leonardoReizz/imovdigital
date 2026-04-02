import { Outlet, NavLink } from 'react-router';
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
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
  lockedKey?: 'leads' | 'team';
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard, end: true },
  { to: '/dashboard/properties', label: 'Imóveis', icon: Building2 },
  { to: '/dashboard/leads', label: 'Leads', icon: MessageSquare, lockedKey: 'leads' },
  { to: '/dashboard/editor', label: 'Editor do Site', icon: PenTool },
  { to: '/dashboard/domain', label: 'Domínio', icon: Globe },
  { to: '/dashboard/contact', label: 'Contato', icon: Phone },
  { to: '/dashboard/team', label: 'Equipe', icon: Users, lockedKey: 'team' },
  { to: '/dashboard/subscription', label: 'Assinatura', icon: CreditCard },
  { to: '/dashboard/settings', label: 'Configurações', icon: Settings },
];

export function DashboardLayout() {
  const { limits, isTrial, trialDaysLeft, trialExpired } = useSubscription();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  const isLocked = (item: NavItem) => {
    if (!item.lockedKey) return false;
    return !limits[item.lockedKey];
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">ImovDigital</h1>
        </div>

        {/* Trial banner */}
        {isTrial && (
          <div className={`mx-4 mt-4 px-3 py-2 rounded-lg text-xs font-medium ${
            trialExpired
              ? 'bg-red-50 text-red-700 border border-red-200'
              : trialDaysLeft <= 2
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {trialExpired
              ? 'Teste expirado'
              : `Teste grátis — ${trialDaysLeft} ${trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}`}
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const locked = isLocked(item);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
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

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
