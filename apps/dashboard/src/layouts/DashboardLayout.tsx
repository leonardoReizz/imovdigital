import { Outlet, NavLink } from 'react-router';
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Palette,
  PenTool,
  Globe,
  Phone,
  Users,
  CreditCard,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard, end: true },
  { to: '/dashboard/properties', label: 'Imóveis', icon: Building2 },
  { to: '/dashboard/leads', label: 'Leads', icon: MessageSquare },
  { to: '/dashboard/branding', label: 'Identidade Visual', icon: Palette },
  { to: '/dashboard/editor', label: 'Editor do Site', icon: PenTool },
  { to: '/dashboard/domain', label: 'Domínio', icon: Globe },
  { to: '/dashboard/contact', label: 'Contato', icon: Phone },
  { to: '/dashboard/team', label: 'Equipe', icon: Users },
  { to: '/dashboard/subscription', label: 'Assinatura', icon: CreditCard },
  { to: '/dashboard/settings', label: 'Configurações', icon: Settings },
];

export function DashboardLayout() {
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">ImovDigital</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
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
