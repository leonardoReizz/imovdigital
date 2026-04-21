'use client';

import { useState, type CSSProperties } from 'react';
import type { Element, Section } from '@imovdigital/types';
import { SectionBody } from './SectionBody';
import { sectionStyleToCss, resolveSection } from './utils/style';
import { useBlocks, useResponsiveBreakpoint } from './context';

interface Props {
  sections: Section[];
}

export function SectionRenderer({ sections }: Props) {
  const { breakpoint } = useBlocks();
  const responsiveBp = useResponsiveBreakpoint();

  return (
    <>
      {sections.map((raw) => {
        const section = resolveSection(raw, breakpoint);
        const hiddenAtBp = section.responsive?.[breakpoint]?.hidden;
        if (hiddenAtBp) return null;

        // Default content max-width = 1440px (same as the desktop canvas
        // width used in the editor). Only `maxWidth: 'full'` opts out —
        // this keeps free-positioned elements (left: 120) visually in the
        // same place regardless of the actual screen size.
        const rawMax = section.style.maxWidth;
        const effectiveMaxWidth =
          rawMax === 'full' ? undefined : (rawMax ?? 1440);

        const isMobileNavbar = section.type === 'navbar' && responsiveBp === 'mobile';

        return (
          <section
            key={section.id}
            data-section-id={section.id}
            data-section-type={section.type}
            style={{
              width: '100%',
              ...sectionStyleToCss(section.style),
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: effectiveMaxWidth,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {isMobileNavbar ? (
                <MobileNavbar section={section} />
              ) : (
                <SectionBody
                  layout={section.layout}
                  gridConfig={section.gridConfig}
                  elements={section.children}
                  sectionId={section.id}
                />
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}

/**
 * Mobile rendering of a navbar section: the first child sits at the left
 * (the logo / site title — any element type), a hamburger button is pinned
 * to the right, and the remaining children render stacked in a drawer that
 * collapses by default. We pick the first child for the "always visible"
 * slot because every template-built navbar has [logo, ...menu] — and users
 * who rebuilt it still tend to put the brand first.
 */
function MobileNavbar({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);
  const children = section.children;
  const first = children[0] as Element | undefined;
  const rest = children.slice(1);

  const headerRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  };

  return (
    <>
      <div style={headerRow}>
        <div style={{ minWidth: 0, flex: 1 }}>
          {first && (
            <SectionBody
              layout="stack"
              gridConfig={{ cols: 1, gap: 0 }}
              elements={[first]}
              sectionId={section.id}
            />
          )}
        </div>
        {rest.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            style={{
              flexShrink: 0,
              width: 40,
              height: 40,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#0f172a',
            }}
          >
            <HamburgerIcon open={open} />
          </button>
        )}
      </div>
      {open && rest.length > 0 && (
        <div style={{ paddingTop: 12 }}>
          <SectionBody
            layout="stack"
            gridConfig={{ cols: 1, gap: 12, alignItems: 'stretch' }}
            elements={rest}
            sectionId={section.id}
          />
        </div>
      )}
    </>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
  );
}
