import { useState, useCallback } from 'react';
import { api, resolveFileUrl } from '../lib/api';

interface UploadOptions {
  folder?: 'banners' | 'logos' | 'gallery';
}

export function useR2Upload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (file: File, options: UploadOptions = {}) => {
    setUploading(true);
    setProgress(0);

    try {
      // Get presigned URL
      const { data } = await api.post('/upload/presigned', {
        filename: file.name,
        contentType: file.type,
        folder: options.folder || 'gallery',
      });

      const { uploadUrl, publicUrl } = data;

      if (uploadUrl) {
        // Upload directly to R2
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          });
          xhr.addEventListener('error', () => reject(new Error('Upload failed')));
          xhr.open('PUT', uploadUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });
      }

      setProgress(100);
      return resolveFileUrl(publicUrl) as string;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading, progress };
}
