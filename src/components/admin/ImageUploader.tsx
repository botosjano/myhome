'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Drag & drop, reorderable image uploader. Images are stored as data URLs for
 * the mock phase (swap for Cloudflare R2 uploads later). The first image is the
 * main/cover photo. Reorder by dragging the thumbnails.
 */
export default function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const readers = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map(
        (file) =>
          new Promise<string>((resolve) => {
            const fr = new FileReader();
            fr.onload = () => resolve(String(fr.result));
            fr.readAsDataURL(file);
          }),
      );
    Promise.all(readers).then((urls) => onChange([...images, ...urls]));
  };

  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed px-4 py-8 text-center transition-colors',
          dragOver ? 'border-gold bg-gold/5' : 'border-navy/20 hover:border-gold',
        )}
      >
        <ImagePlus className="h-7 w-7 text-gold" />
        <p className="font-sans text-sm text-navy/70">
          Húzza ide a képeket, vagy <span className="text-gold underline">tallózzon</span>
        </p>
        <p className="font-sans text-xs text-navy/40">Több kép is feltölthető · az első a borítókép</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <div
              key={`${i}-${src.slice(-12)}`}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null) reorder(dragIndex.current, i);
                dragIndex.current = null;
              }}
              className="group relative aspect-[4/3] cursor-move overflow-hidden rounded-sm border border-navy/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Kép ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 flex items-center gap-1 rounded-sm bg-navy/80 px-1.5 py-0.5 font-sans text-[9px] font-medium uppercase tracking-wide text-gold">
                  <Star className="h-2.5 w-2.5 fill-gold" />
                  Borító
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Kép törlése"
                className="absolute right-1 top-1 rounded-sm bg-navy/70 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
