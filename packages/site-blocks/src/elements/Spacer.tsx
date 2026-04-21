import type { SpacerElement } from '@imovdigital/types';

export function SpacerBlock({ element }: { element: SpacerElement }) {
  return <div style={{ height: element.height, width: '100%' }} aria-hidden />;
}
