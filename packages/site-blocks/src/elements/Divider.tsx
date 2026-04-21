import type { DividerElement } from '@imovdigital/types';

export function DividerBlock({ element }: { element: DividerElement }) {
  return (
    <hr
      style={{
        border: 'none',
        borderTopWidth: element.thickness,
        borderTopStyle: element.lineStyle,
        borderTopColor: element.color,
        width: '100%',
        margin: 0,
      }}
    />
  );
}
