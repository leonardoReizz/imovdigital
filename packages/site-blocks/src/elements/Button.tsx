import type { ButtonElement } from '@imovdigital/types';
import { elementStyleToCss } from '../utils/style';
import { useBlocks, useIsEditMode } from '../context';

export function ButtonBlock({ element }: { element: ButtonElement }) {
  const { theme } = useBlocks();
  const isEdit = useIsEditMode();

  const variantStyle: React.CSSProperties = (() => {
    switch (element.variant) {
      case 'primary':
        return { background: theme.primaryColor, color: '#fff', border: 'none' };
      case 'secondary':
        return { background: theme.secondaryColor, color: '#fff', border: 'none' };
      case 'outline':
        return {
          background: 'transparent',
          color: theme.primaryColor,
          border: `1px solid ${theme.primaryColor}`,
        };
      case 'ghost':
        return { background: 'transparent', color: theme.primaryColor, border: 'none' };
    }
  })();

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: theme.borderRadius,
    fontWeight: 500,
    textDecoration: 'none',
    cursor: isEdit ? 'default' : 'pointer',
    ...variantStyle,
    ...elementStyleToCss(element.style),
  };

  if (isEdit) {
    return <span style={style}>{element.label}</span>;
  }

  return (
    <a
      href={element.url}
      target={element.openInNewTab ? '_blank' : undefined}
      rel={element.openInNewTab ? 'noopener noreferrer' : undefined}
      style={style}
    >
      {element.label}
    </a>
  );
}
