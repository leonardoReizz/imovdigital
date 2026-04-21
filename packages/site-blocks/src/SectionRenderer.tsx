'use client';

import type { Section } from '@imovdigital/types';
import { SectionBody } from './SectionBody';
import { sectionStyleToCss, resolveSection } from './utils/style';
import { useBlocks } from './context';

interface Props {
  sections: Section[];
}

export function SectionRenderer({ sections }: Props) {
  const { breakpoint } = useBlocks();

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
              <SectionBody
                layout={section.layout}
                gridConfig={section.gridConfig}
                elements={section.children}
                sectionId={section.id}
              />
            </div>
          </section>
        );
      })}
    </>
  );
}
