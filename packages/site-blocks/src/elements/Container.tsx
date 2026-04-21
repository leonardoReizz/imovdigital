import type { ContainerElement } from '@imovdigital/types';
import { elementStyleToCss } from '../utils/style';
import { SectionBody } from '../SectionBody';

// Containers are rendered inline inside a parent Section. For now the
// sectionId passed down is the container's own id — good enough for
// wrap-element disambiguation in editor mode.
export function ContainerBlock({ element }: { element: ContainerElement }) {
  return (
    <SectionBody
      layout={element.layout}
      gridConfig={element.gridConfig}
      elements={element.children}
      sectionId={element.id}
      style={elementStyleToCss(element.style)}
    />
  );
}
