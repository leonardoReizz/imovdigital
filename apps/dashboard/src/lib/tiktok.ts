type TtqProps = Record<string, unknown>;

declare global {
  interface Window {
    ttq?: {
      track: (event: string, props?: TtqProps, options?: { event_id?: string }) => void;
      identify: (data: TtqProps) => void;
      page: () => void;
    };
  }
}

export function tiktokTrack(event: string, props?: TtqProps) {
  if (typeof window === 'undefined' || !window.ttq) return;
  window.ttq.track(event, props);
}
