import { useState } from 'react';
import { Link } from 'react-router';
import { Menu, X, Phone } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  transparent?: boolean;
}

export function Header({ transparent }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <header
      className={`w-full z-50 ${
        transparent
          ? 'absolute top-0 left-0 bg-transparent'
          : 'bg-white border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="text-xl sm:text-2xl font-bold tracking-tight"
              style={{
                fontFamily: theme.typography.headingFont,
                color: transparent ? '#fff' : theme.colors.text,
              }}
            >
              Imobiliária
            </span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-8 text-sm font-medium"
            style={{ color: transparent ? 'rgba(255,255,255,0.9)' : theme.colors.text }}
          >
            <Link to="/" className="hover:opacity-80 transition-opacity">Início</Link>
            <Link to="/?type=APARTMENT" className="hover:opacity-80 transition-opacity">Apartamentos</Link>
            <Link to="/?type=HOUSE" className="hover:opacity-80 transition-opacity">Casas</Link>
            <Link to="/?listing=RENT" className="hover:opacity-80 transition-opacity">Alugar</Link>
            <a
              href="#contact"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: transparent ? 'rgba(255,255,255,0.15)' : theme.colors.primary }}
            >
              <Phone className="w-3.5 h-3.5" />
              Contato
            </a>
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: transparent ? '#fff' : theme.colors.text }}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
          <nav className="flex flex-col p-4 gap-1">
            {[
              { to: '/', label: 'Início' },
              { to: '/?type=APARTMENT', label: 'Apartamentos' },
              { to: '/?type=HOUSE', label: 'Casas' },
              { to: '/?listing=RENT', label: 'Alugar' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-lg hover:bg-gray-50 font-medium"
                style={{ color: theme.colors.text }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
