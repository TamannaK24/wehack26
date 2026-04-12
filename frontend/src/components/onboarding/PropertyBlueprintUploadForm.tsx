import { Image, Layers, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DocumentUploads } from './types';

const MAX_PHOTOS = 12;

export type PropertyBlueprintUploadFormProps = {
  value: DocumentUploads;
  onChange: (next: DocumentUploads) => void;
  idPrefix?: string;
};

export function PropertyBlueprintUploadForm({
  value,
  onChange,
  idPrefix = 'property-media',
}: PropertyBlueprintUploadFormProps) {
  const p = idPrefix;
  const [blueprintPreview, setBlueprintPreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const setBlueprint = (file: File | null) => {
    onChange({ ...value, blueprintFile: file });
  };

  const setPhotos = (photos: File[]) => {
    onChange({ ...value, propertyPhotos: photos });
  };

  const removePhoto = (index: number) => {
    setPhotos(value.propertyPhotos.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!value.blueprintFile) {
      setBlueprintPreview(null);
      return;
    }

    const url = URL.createObjectURL(value.blueprintFile);
    setBlueprintPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [value.blueprintFile]);

  useEffect(() => {
    const urls = value.propertyPhotos.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [value.propertyPhotos]);

  return (
    <section className="border border-red-950/40 bg-[#0c0a0a]/80 p-8 space-y-6">
      <div className="flex items-center gap-3 text-red-400/90">
        <Layers size={22} aria-hidden />
        <div>
          <h2 className="font-headline text-xl uppercase tracking-wide text-white">Blueprint &amp; property photos</h2>
          <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
            Optional — floor plan, elevations, or site photos help underwriters align coverage with your layout
          </p>
        </div>
      </div>
      <p className="text-sm text-zinc-400">
        Upload a single blueprint or plan file (PDF or image). Add up to {MAX_PHOTOS} supporting photos (exterior,
        systems, damage, or other relevant angles).
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block cursor-pointer space-y-2 border border-dashed border-red-950/50 bg-[#030203]/80 p-4 hover:border-red-900/50">
          <span className="flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-red-400/90">
            <Layers size={14} aria-hidden />
            Home blueprint / floor plan
          </span>
          <input
            id={`${p}-blueprint`}
            name={`${p}Blueprint`}
            type="file"
            className="text-xs text-zinc-400 file:mr-3 file:border file:border-red-900/40 file:bg-red-950/30 file:px-3 file:py-1.5 file:font-label file:text-[9px] file:uppercase file:tracking-wider file:text-red-200"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.svg"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setBlueprint(file);
              e.target.value = '';
            }}
          />
          {value.blueprintFile ? (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-xs text-zinc-500">{value.blueprintFile.name}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setBlueprint(null);
                  }}
                  className="shrink-0 rounded-sm p-1 text-zinc-500 hover:bg-red-950/50 hover:text-red-200"
                  aria-label="Remove blueprint file"
                >
                  <X size={14} />
                </button>
              </div>

              {blueprintPreview &&
                (value.blueprintFile.type === 'application/pdf' ? (
                  <div className="space-y-2">
                    <div className="overflow-hidden border border-red-950/30 bg-[#0a0808]">
                      <iframe
                        src={blueprintPreview}
                        title={value.blueprintFile.name}
                        className="h-64 w-full bg-white"
                      />
                    </div>
                    <a
                      href={blueprintPreview}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-xs text-red-300 hover:text-red-200"
                    >
                      Open blueprint preview
                    </a>
                  </div>
                ) : (
                  <div className="overflow-hidden border border-red-950/30 bg-[#0a0808]">
                    <img
                      src={blueprintPreview}
                      alt={value.blueprintFile.name}
                      className="h-64 w-full object-contain bg-black/30"
                    />
                  </div>
                ))}
            </div>
          ) : null}
        </label>

        <div className="space-y-3 border border-dashed border-red-950/50 bg-[#030203]/80 p-4 hover:border-red-900/50">
          <span className="flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-red-400/90">
            <Image size={14} aria-hidden />
            Relevant photos
          </span>
          <label className="block cursor-pointer">
            <input
              id={`${p}-photos`}
              name={`${p}Photos`}
              type="file"
              multiple
              className="text-xs text-zinc-400 file:mr-3 file:border file:border-red-900/40 file:bg-red-950/30 file:px-3 file:py-1.5 file:font-label file:text-[9px] file:uppercase file:tracking-wider file:text-red-200"
              accept=".png,.jpg,.jpeg,.webp,.heic,.heif"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                e.target.value = '';
                if (picked.length === 0) return;
                const merged = [...value.propertyPhotos, ...picked].slice(0, MAX_PHOTOS);
                setPhotos(merged);
              }}
            />
          </label>
          {value.propertyPhotos.length > 0 ? (
            <div className="space-y-3 border-t border-red-950/30 pt-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {value.propertyPhotos.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="overflow-hidden border border-red-950/30 bg-[#0a0808]"
                  >
                    <div className="aspect-[4/3] bg-black/30">
                      <img
                        src={photoPreviews[index]}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2">
                      <span className="min-w-0 truncate text-xs text-zinc-400">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="shrink-0 rounded-sm p-1 text-zinc-500 hover:bg-red-950/50 hover:text-red-200"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-600">No photos added yet.</p>
          )}
          {value.propertyPhotos.length >= MAX_PHOTOS ? (
            <p className="text-xs text-amber-400/90">Maximum {MAX_PHOTOS} photos reached. Remove one to add more.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
