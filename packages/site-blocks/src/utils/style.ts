import type { CSSProperties } from 'react';
import type {
  Breakpoint,
  Element,
  ElementStyle,
  Section,
  SectionStyle,
  ResponsiveElementOverride,
} from '@imovdigital/types';

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
};

export function elementStyleToCss(style: ElementStyle | undefined): CSSProperties {
  if (!style) return {};
  const css: CSSProperties = {};

  if (style.color) css.color = style.color;
  if (style.backgroundColor) css.backgroundColor = style.backgroundColor;
  if (style.borderRadius !== undefined) css.borderRadius = style.borderRadius;
  if (style.borderWidth !== undefined) css.borderWidth = style.borderWidth;
  if (style.borderColor) css.borderColor = style.borderColor;
  if (style.borderWidth !== undefined) css.borderStyle = 'solid';
  if (style.paddingTop !== undefined) css.paddingTop = style.paddingTop;
  if (style.paddingBottom !== undefined) css.paddingBottom = style.paddingBottom;
  if (style.paddingX !== undefined) {
    css.paddingLeft = style.paddingX;
    css.paddingRight = style.paddingX;
  }
  if (style.fontSize !== undefined) css.fontSize = style.fontSize;
  if (style.fontWeight !== undefined) css.fontWeight = style.fontWeight;
  if (style.fontFamily) css.fontFamily = style.fontFamily;
  if (style.lineHeight !== undefined) css.lineHeight = style.lineHeight;
  if (style.letterSpacing !== undefined) css.letterSpacing = style.letterSpacing;
  if (style.textAlign) css.textAlign = style.textAlign;
  if (style.opacity !== undefined) css.opacity = style.opacity;
  if (style.shadow) css.boxShadow = SHADOW_MAP[style.shadow] ?? undefined;

  return css;
}

export function sectionStyleToCss(style: SectionStyle | undefined): CSSProperties {
  if (!style) return {};
  const css: CSSProperties = {};

  if (style.backgroundColor) css.backgroundColor = style.backgroundColor;
  if (style.backgroundImage) {
    css.backgroundImage = `url(${style.backgroundImage})`;
    css.backgroundSize = 'cover';
    css.backgroundPosition = 'center';
  }
  if (style.paddingTop !== undefined) css.paddingTop = style.paddingTop;
  if (style.paddingBottom !== undefined) css.paddingBottom = style.paddingBottom;
  if (style.paddingX !== undefined) {
    css.paddingLeft = style.paddingX;
    css.paddingRight = style.paddingX;
  }
  if (style.minHeight !== undefined) css.minHeight = style.minHeight;
  if (style.align) css.textAlign = style.align;

  return css;
}

export function resolveSection(section: Section, breakpoint: Breakpoint): Section {
  const override = section.responsive?.[breakpoint];
  if (!override) return section;
  return {
    ...section,
    style: { ...section.style, ...(override.style ?? {}) },
    gridConfig: override.gridConfig
      ? { ...(section.gridConfig ?? { cols: 1, gap: 16 }), ...override.gridConfig }
      : section.gridConfig,
  };
}

export function resolveElement(element: Element, breakpoint: Breakpoint): Element {
  const override: ResponsiveElementOverride | undefined =
    element.responsive?.[breakpoint];
  if (!override) return element;
  return {
    ...element,
    position: override.position ?? element.position,
    size: override.size ?? element.size,
    style: { ...element.style, ...(override.style ?? {}) },
  };
}

export function isElementHidden(element: Element, breakpoint: Breakpoint): boolean {
  return !!element.hidden?.[breakpoint];
}
