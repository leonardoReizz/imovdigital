import type { AboutSettings } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
import { Building2 } from 'lucide-react';
import { Img } from '../../Img';

export function AboutPreview({ settings }: { settings: AboutSettings }) {
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const isMobile = breakpoint === 'mobile';
  const imageFirst = settings.imagePosition === 'left';

  return (
    <div style={{ padding: isMobile ? '40px 16px' : '64px 32px' }}>
      <div className="max-w-6xl mx-auto">
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : imageFirst ? 'row' : 'row-reverse',
            gap: isMobile ? 32 : 48,
            alignItems: 'center',
          }}
        >
          {/* Image */}
          <div style={{ flex: 1 }} className="w-full">
            {settings.imageUrl ? (
              <Img src={settings.imageUrl} alt={settings.title} className="w-full rounded-xl object-cover aspect-[4/3]" />
            ) : (
              <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-16 h-16 text-gray-200" />
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1 }} className="space-y-4">
            <h2 style={{ fontSize: isMobile ? 22 : 30 }} className="font-bold text-gray-900">{settings.title}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{settings.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
