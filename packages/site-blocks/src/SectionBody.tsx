import type { CSSProperties, ReactNode } from 'react';
import type { Element, GridConfig, SectionLayout } from '@imovdigital/types';
import { ElementRenderer } from './ElementRenderer';
import { useBlocks } from './context';
import { isElementHidden, resolveElement } from './utils/style';

interface Props {
  layout: SectionLayout;
  gridConfig?: GridConfig;
  elements: Element[];
  sectionId: string;
  // Pass-through style (section or container wrapper already handles padding).
  style?: CSSProperties;
}

export function SectionBody({ layout, gridConfig, elements, sectionId, style }: Props) {
  const { breakpoint, wrapElement } = useBlocks();

  const JUSTIFY_MAP: Record<string, CSSProperties['justifyContent']> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
  };
  const ALIGN_MAP: Record<string, CSSProperties['alignItems']> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  };

  const containerStyle: CSSProperties =
    layout === 'free'
      ? { position: 'relative', width: '100%', minHeight: 320, ...style }
      : layout === 'grid'
        ? {
            display: 'grid',
            gridTemplateColumns: `repeat(${gridConfig?.cols ?? 3}, minmax(0, 1fr))`,
            gap: gridConfig?.gap ?? 24,
            width: '100%',
            ...style,
          }
        : {
            display: 'flex',
            flexDirection: gridConfig?.direction === 'row' ? 'row' : 'column',
            gap: gridConfig?.gap ?? 16,
            justifyContent: gridConfig?.justifyContent
              ? JUSTIFY_MAP[gridConfig.justifyContent]
              : undefined,
            alignItems: gridConfig?.alignItems
              ? ALIGN_MAP[gridConfig.alignItems]
              : undefined,
            width: '100%',
            ...style,
          };

  return (
    <div style={containerStyle}>
      {elements.map((raw) => {
        if (isElementHidden(raw, breakpoint)) return null;
        const element = resolveElement(raw, breakpoint);
        const inner = <ElementRenderer element={element} />;

        // In edit mode, the wrapElement is responsible for positioning /
        // sizing the node so resize + drag feedback stays in sync. In
        // production, we apply a default wrapper here.
        if (wrapElement) {
          return wrapElement(element, inner, {
            sectionId,
            layout,
            parentCols: layout === 'grid' ? (gridConfig?.cols ?? 3) : undefined,
            parentGap: gridConfig?.gap,
          });
        }
        return renderForLayout(layout, element, inner);
      })}
    </div>
  );
}

function renderForLayout(layout: SectionLayout, element: Element, inner: ReactNode): ReactNode {
  if (layout === 'free') {
    const { x = 0, y = 0 } = element.position ?? {};
    const { w = 'auto', h = 'auto' } = element.size ?? {};
    return (
      <div
        key={element.id}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w === 'full' ? '100%' : w,
          height: h,
        }}
      >
        {inner}
      </div>
    );
  }

  // stack / grid: each child fills its cell; parent controls size.
  // In grid, `gridSpan` lets a child occupy multiple columns.
  const gridColumn =
    layout === 'grid' && element.gridSpan && element.gridSpan > 1
      ? `span ${element.gridSpan}`
      : undefined;
  // Elements may carry an explicit height when placed in grid/stack (resized
  // via n/s handles in the editor); omitted or 'auto' lets intrinsic sizing win.
  const explicitHeight = element.size?.h;
  return (
    <div
      key={element.id}
      style={{
        gridColumn,
        ...(typeof explicitHeight === 'number' ? { height: explicitHeight } : {}),
      }}
    >
      {inner}
    </div>
  );
}
