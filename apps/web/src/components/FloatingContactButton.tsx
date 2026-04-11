'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { LeadForm } from './LeadForm';

interface Props {
  tenantSlug: string;
  propertyId: string;
  propertyTitle: string;
  primaryColor: string;
}

export function FloatingContactButton({ tenantSlug, propertyId, propertyTitle, primaryColor }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)} />
          <div className="fixed bottom-20 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: primaryColor }}>
              <span className="text-white text-sm font-semibold">Tenho interesse</span>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <LeadForm
                tenantSlug={tenantSlug}
                propertyId={propertyId}
                propertyTitle={propertyTitle}
                primaryColor={primaryColor}
              />
            </div>
          </div>
        </>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-4 z-50 flex items-center gap-2 px-5 py-3 text-white rounded-full shadow-lg hover:opacity-90 transition-all"
        style={{ backgroundColor: primaryColor }}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        {!open && <span className="text-sm font-medium">Interessado?</span>}
      </button>
    </>
  );
}
