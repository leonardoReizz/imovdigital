import type { AgentsSettings } from '@imovdigital/types';
import { useEditorStore } from '../../../store/editorStore';
import { User, Phone, Mail } from 'lucide-react';

function AgentCard({ showContact }: { showContact: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <User className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="font-semibold text-gray-900">Nome do Corretor</h3>
      <p className="text-sm text-gray-500 mt-1">CRECI 00000</p>
      {showContact && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="p-2 bg-gray-50 rounded-lg">
            <Phone className="w-4 h-4 text-gray-400" />
          </span>
          <span className="p-2 bg-gray-50 rounded-lg">
            <Mail className="w-4 h-4 text-gray-400" />
          </span>
        </div>
      )}
    </div>
  );
}

export function AgentsPreview({ settings }: { settings: AgentsSettings }) {
  const breakpoint = useEditorStore((s) => s.previewBreakpoint);
  const isMobile = breakpoint === 'mobile';
  const columns = isMobile ? 1 : 3;

  return (
    <div style={{ padding: isMobile ? '40px 16px' : '64px 32px' }} className="bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 style={{ fontSize: isMobile ? 22 : 30 }} className="font-bold text-gray-900">{settings.title}</h2>
          <p className="text-gray-500 mt-2">{settings.subtitle}</p>
        </div>
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[1, 2, 3].map((i) => (
            <AgentCard key={i} showContact={settings.showContact} />
          ))}
        </div>
      </div>
    </div>
  );
}
