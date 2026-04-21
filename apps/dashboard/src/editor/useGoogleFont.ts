import { useEffect } from 'react';

/**
 * Injects a Google Fonts <link> for the given family the first time it
 * is requested. No-ops for system / generic families. Links are kept in
 * the document so switching back to a previously loaded font is instant.
 */
export function useGoogleFont(fontFamily: string | undefined | null) {
  useEffect(() => {
    if (!fontFamily) return;
    const first = fontFamily.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
    if (!first) return;
    if (/^(system-ui|sans-serif|serif|monospace|ui-[a-z]+|-apple-system)$/i.test(first)) {
      return;
    }
    const id = `gf-${first.replace(/\W+/g, '-').toLowerCase()}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${first.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`;
    document.head.appendChild(link);
  }, [fontFamily]);
}
