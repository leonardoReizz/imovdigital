import type { AgentsSettings } from '@imovdigital/types';
import { useEditorStore } from '../../../../store/editorStore';
import { User, Phone, Mail } from 'lucide-react';

export function AgentsPreview({ settings }: { settings: AgentsSettings }) {
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const isMobile = breakpoint === 'mobile';

  return (
    <div style={{ padding: isMobile ? '40px 16px' : '80px 32px' }} className="bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-bold text-gray-900 leading-tight mb-3" style={{ fontSize: isMobile ? 28 : 44, fontFamily: 'Georgia, serif' }}>{settings.title}</h2>
          <p className="text-gray-500" style={{ fontSize: isMobile ? 15 : 17 }}>{settings.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" style={{ columnGap: 32, rowGap: 48 }}>
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="bg-stone-100 mb-4 flex items-center justify-center" style={{ aspectRatio: '4/5' }}>
                <User className="w-16 h-16 text-stone-300" />
              </div>
              <p className="uppercase text-gray-400 mb-1" style={{ fontSize: 10, letterSpacing: '0.2em' }}>Corretor</p>
              <p className="text-gray-900 mb-2" style={{ fontSize: 19, fontFamily: 'Georgia, serif' }}>Nome do corretor</p>
              <p className="text-xs text-gray-500">CRECI 00000</p>
              {settings.showContact && (
                <div className="flex items-center gap-2 mt-3 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span className="w-px h-4 bg-gray-200" />
                  <Mail className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
