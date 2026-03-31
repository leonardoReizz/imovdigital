import { useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';

const AUTO_SAVE_DELAY = 30_000; // 30 seconds

export function useAutoSave() {
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const save = useEditorStore((s) => s.save);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (isDirty && !isSaving) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        save().catch(() => {
          // Error handled at component level
        });
      }, AUTO_SAVE_DELAY);
    }

    return () => clearTimeout(timerRef.current);
  }, [isDirty, isSaving, save]);
}
