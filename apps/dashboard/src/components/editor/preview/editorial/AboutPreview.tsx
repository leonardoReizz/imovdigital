import type { AboutSettings } from '@imovdigital/types';
import { useEditorStore } from '../../../../store/editorStore';
import { Building2 } from 'lucide-react';
import { Img } from '../../../Img';

export function AboutPreview({ settings }: { settings: AboutSettings }) {
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const primaryColor = useEditorStore((s) => s.config?.primaryColor || '#2563eb');
  const isMobile = breakpoint === 'mobile';
  const imageLeft = settings.imagePosition === 'left';

  return (
    <div style={{ padding: isMobile ? '40px 16px' : '96px 32px', backgroundColor: '#fafaf9' }}>
      <div className="max-w-7xl mx-auto">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 32 : 48,
            alignItems: 'center',
          }}
        >
          <div className="relative" style={{ order: isMobile || imageLeft ? 0 : 2 }}>
            {settings.imageUrl ? (
              <Img src={settings.imageUrl} alt={settings.title} className="w-full object-cover" style={{ aspectRatio: '4/5' }} />
            ) : (
              <div className="w-full bg-stone-200 flex items-center justify-center" style={{ aspectRatio: '4/5' }}>
                <Building2 className="w-20 h-20 text-stone-300" />
              </div>
            )}
            {!isMobile && (
              <div
                className="absolute px-5 py-3 bg-white shadow-xl"
                style={{
                  bottom: -16,
                  [imageLeft ? 'right' : 'left']: -10,
                  borderLeft: `4px solid ${primaryColor}`,
                }}
              >
                <p className="uppercase font-semibold text-gray-400" style={{ fontSize: 9, letterSpacing: '0.2em' }}>Desde</p>
                <p className="font-bold text-gray-900" style={{ fontSize: 22, fontFamily: 'Georgia, serif' }}>2010</p>
              </div>
            )}
          </div>
          <div className="space-y-5">
            <span
              className="inline-block uppercase font-semibold pb-1.5 border-b-2"
              style={{ color: primaryColor, borderColor: primaryColor, fontSize: 11, letterSpacing: '0.2em' }}
            >
              — Quem somos
            </span>
            <h2 className="font-bold text-gray-900 leading-tight" style={{ fontSize: isMobile ? 28 : 42, fontFamily: 'Georgia, serif' }}>
              {settings.title}
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line" style={{ fontSize: isMobile ? 15 : 17 }}>{settings.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
