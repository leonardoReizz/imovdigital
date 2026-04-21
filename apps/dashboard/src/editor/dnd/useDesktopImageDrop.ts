import { useEffect, useRef, useState, type RefObject } from 'react';
import { useR2Upload } from '../../hooks/useR2Upload';
import { useEditorStore } from '../store';
import type { ImageElement } from '@imovdigital/types';

interface Options {
  rootRef: RefObject<HTMLElement | null>;
}

interface UploadStatus {
  isOver: boolean;
  uploading: boolean;
  progress: number;
}

/**
 * Listens for native HTML5 drag/drop of image files on the canvas.
 * On drop:
 *   - Resolves the section under the pointer via DOM lookup (`data-section-id`).
 *   - Uploads the file to R2.
 *   - Inserts a new ImageElement at the drop position (free sections) or at
 *     the end of the section's children (stack/grid).
 */
export function useDesktopImageDrop({ rootRef }: Options): UploadStatus {
  const [isOver, setIsOver] = useState(false);
  const enterDepth = useRef(0);
  const { upload, uploading, progress } = useR2Upload();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const hasFiles = (e: DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes('Files');

    const handleEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      enterDepth.current += 1;
      setIsOver(true);
    };

    const handleOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };

    const handleLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      enterDepth.current = Math.max(0, enterDepth.current - 1);
      if (enterDepth.current === 0) setIsOver(false);
    };

    const handleDrop = async (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      enterDepth.current = 0;
      setIsOver(false);

      const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
        f.type.startsWith('image/'),
      );
      if (files.length === 0) return;

      // Find the section under the drop point.
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const sectionEl = target?.closest('[data-section-id]') as HTMLElement | null;
      if (!sectionEl) return;
      const sectionId = sectionEl.dataset.sectionId;
      if (!sectionId) return;

      const rect = sectionEl.getBoundingClientRect();
      const dropX = e.clientX - rect.left;
      const dropY = e.clientY - rect.top;

      const store = useEditorStore.getState();
      const page = store.page;
      const section = page?.sections.find((s) => s.id === sectionId);
      if (!section) return;

      for (const file of files) {
        try {
          const publicUrl = await upload(file, { folder: 'gallery' });

          const id = crypto.randomUUID();
          const isFree = section.layout === 'free';
          const image: ImageElement = {
            id,
            type: 'image',
            src: publicUrl,
            alt: file.name.replace(/\.[^/.]+$/, ''),
            objectFit: 'cover',
            style: { borderRadius: 8 },
            ...(isFree
              ? {
                  position: { x: Math.round(dropX), y: Math.round(dropY) },
                  size: { w: 320, h: 200 },
                }
              : { size: { w: 'full', h: 'auto' } }),
          };

          store.updateSection(sectionId, (s) => {
            s.children.push(image);
          });
          store.select({ kind: 'element', id });
        } catch (err) {
          console.error('[upload] failed:', err);
        }
      }
    };

    root.addEventListener('dragenter', handleEnter);
    root.addEventListener('dragover', handleOver);
    root.addEventListener('dragleave', handleLeave);
    root.addEventListener('drop', handleDrop);

    return () => {
      root.removeEventListener('dragenter', handleEnter);
      root.removeEventListener('dragover', handleOver);
      root.removeEventListener('dragleave', handleLeave);
      root.removeEventListener('drop', handleDrop);
    };
  }, [rootRef, upload]);

  return { isOver, uploading, progress };
}
