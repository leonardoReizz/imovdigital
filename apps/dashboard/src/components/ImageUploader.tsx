import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { ImagePlus, X, GripVertical, Star } from 'lucide-react';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  alt: string;
}

interface ImageUploaderProps {
  images: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function ImageUploader({
  images,
  onChange,
  maxFiles = 20,
  maxSizeMB = 10,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const dragCounter = useRef(0);

  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      setError('');
      const files = Array.from(fileList);

      const remaining = maxFiles - images.length;
      if (remaining <= 0) {
        setError(`Limite de ${maxFiles} imagens atingido`);
        return;
      }

      const valid: ImageFile[] = [];

      for (const file of files.slice(0, remaining)) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError('Formato não suportado. Use PNG, JPG ou WebP.');
          continue;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`Imagem "${file.name}" excede ${maxSizeMB}MB`);
          continue;
        }

        valid.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          preview: URL.createObjectURL(file),
          alt: file.name.replace(/\.[^.]+$/, ''),
        });
      }

      if (valid.length > 0) {
        onChange([...images, ...valid]);
      }
    },
    [images, onChange, maxFiles, maxSizeMB],
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeImage = (id: string) => {
    const img = images.find((i) => i.id === id);
    if (img) URL.revokeObjectURL(img.preview);
    onChange(images.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-primary bg-primary-light'
            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
        <ImagePlus
          className={`w-10 h-10 mx-auto mb-3 ${
            dragging ? 'text-blue-400' : 'text-gray-300'
          }`}
        />
        <p className="text-sm font-medium text-gray-600">
          {dragging
            ? 'Solte as imagens aqui'
            : 'Arraste imagens ou clique para enviar'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PNG, JPG ou WebP. Máximo {maxSizeMB}MB por imagem. Até {maxFiles} imagens.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          A primeira imagem será usada como capa no portal e nos resultados do Google.
        </p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Image grid with reorder */}
      {images.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">
            Arraste para reordenar. A primeira imagem será a capa.
          </p>
          <Reorder.Group
            axis="x"
            values={images}
            onReorder={onChange}
            className="flex flex-wrap gap-3"
          >
            {images.map((img, index) => (
              <Reorder.Item
                key={img.id}
                value={img}
                className="relative group"
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`relative w-32 h-32 rounded-xl overflow-hidden border-2 cursor-grab active:cursor-grabbing ${
                    index === 0 ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={img.preview}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />

                  {/* Cover badge */}
                  {index === 0 && (
                    <div className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      Capa
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <GripVertical className="w-5 h-5 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(img.id);
                    }}
                    className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {/* Count */}
      {images.length > 0 && (
        <p className="text-xs text-gray-400">
          {images.length}/{maxFiles} imagens
        </p>
      )}
    </div>
  );
}
