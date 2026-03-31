import { createContext, useContext, useState, useEffect } from 'react';
import type { SiteTheme } from '@imovdigital/types';
import { THEME_MODERNO } from '@imovdigital/types';
import { api } from '../lib/api';

interface ThemeContextValue {
  theme: SiteTheme;
  tenantSlug: string;
  setTheme: (theme: SiteTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEME_MODERNO,
  tenantSlug: '',
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<SiteTheme>(THEME_MODERNO);
  const [tenantSlug, setTenantSlug] = useState('');

  // Listen for postMessage from the branding editor iframe parent
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'IMOVDIGITAL_THEME_UPDATE') {
        if (event.data.theme) setTheme(event.data.theme);
        if (event.data.tenantSlug) setTenantSlug(event.data.tenantSlug);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // On standalone load (not in iframe), try to detect tenant from URL or fetch default
  useEffect(() => {
    if (tenantSlug) return; // Already set via postMessage

    // Check URL params first (for direct access)
    const params = new URLSearchParams(window.location.search);
    const slugParam = params.get('tenant');
    if (slugParam) {
      setTenantSlug(slugParam);
      return;
    }

    // Try to detect from subdomain
    const host = window.location.hostname;
    const baseDomain = 'imovdigital.com.br';
    if (host.endsWith(`.${baseDomain}`)) {
      setTenantSlug(host.replace(`.${baseDomain}`, ''));
      return;
    }

    // Fallback: fetch first available tenant (dev only)
    if (host === 'localhost' || host === '127.0.0.1') {
      api.get('/public/tenants/first').catch(() => {});
    }
  }, [tenantSlug]);

  // Apply CSS custom properties from theme
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-muted', theme.colors.textMuted);
    root.style.setProperty('--font-heading', theme.typography.headingFont);
    root.style.setProperty('--font-body', theme.typography.bodyFont);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, tenantSlug, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
