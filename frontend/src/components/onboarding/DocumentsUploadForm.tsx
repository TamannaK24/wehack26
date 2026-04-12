import { FileUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DocumentUploads } from './types';

export type DocumentsUploadFormProps = {
  value: DocumentUploads;
  onChange: (next: DocumentUploads) => void;
  onClaimsFileChange?: (files: File[]) => void;
  onInspectionFileChange?: (files: File[]) => void;
  idPrefix?: string;
};

function DocumentPreviewList({
  title,
  files,
  previewUrls,
  onRemove,
}: {
  title: string;
  files: File[];
  previewUrls: string[];
  onRemove: (index: number) => void;
}) {
  if (files.length === 0) {
    return <p className="text-xs text-zinc-600">No files added yet.</p>;
  }

  return (
    <div className="space-y-3 border-t border-red-950/30 pt-3">
      <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500">{title}</p>
      <div className="max-h-[32rem] space-y-4 overflow-y-auto pr-1">
        {files.map((file, index) => {
          const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
          const isImage = file.type.startsWith('image/');

          return (
            <div
              key={`${file.name}-${file.size}-${index}`}
              className="overflow-hidden border border-red-950/30 bg-[#0a0808]"
            >
              <div className="flex items-center justify-between gap-2 border-b border-red-950/30 px-3 py-2">
                <span className="min-w-0 truncate text-xs text-zinc-400">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="shrink-0 rounded-sm p-1 text-zinc-500 hover:bg-red-950/50 hover:text-red-200"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={14} />
                </button>
              </div>
              {isPdf ? (
                <iframe
                  src={previewUrls[index]}
                  title={file.name}
                  className="h-[28rem] w-full bg-white"
                />
              ) : isImage ? (
                <img
                  src={previewUrls[index]}
                  alt={file.name}
                  className="h-[28rem] w-full object-contain bg-black/30"
                />
              ) : (
                <div className="flex h-40 items-center justify-center px-4 text-sm text-zinc-500">
                  Preview not available for this file type.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DocumentsUploadForm({
  value,
  onChange,
  onClaimsFileChange,
  onInspectionFileChange,
  idPrefix = 'docs',
}: DocumentsUploadFormProps) {
  const p = idPrefix;
  const [claimsPreviewUrls, setClaimsPreviewUrls] = useState<string[]>([]);
  const [inspectionPreviewUrls, setInspectionPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = value.claimsFiles.map((file) => URL.createObjectURL(file));
    setClaimsPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [value.claimsFiles]);

  useEffect(() => {
    const urls = value.inspectionFiles.map((file) => URL.createObjectURL(file));
    setInspectionPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [value.inspectionFiles]);

  const setClaimsFiles = (files: File[]) => {
    onChange({ ...value, claimsFiles: files });
  };

  const setInspectionFiles = (files: File[]) => {
    onChange({ ...value, inspectionFiles: files });
  };

  return (
    <section className="border border-red-950/40 bg-[#0c0a0a]/80 p-8 space-y-6">
      <div className="flex items-center gap-3 text-red-400/90">
        <FileUp size={22} />
        <h2 className="font-headline text-xl uppercase tracking-wide text-white">Documents</h2>
      </div>
      <p className="text-sm text-zinc-400">
        Upload your claims package and inspections report (PDF or images).{' '}
        <span className="text-zinc-500">Optional for now.</span>
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block space-y-2 p-4 border border-dashed border-red-950/50 bg-[#030203]/80 hover:border-red-900/50 cursor-pointer">
          <span className="font-label text-[10px] uppercase tracking-widest text-red-400/90">Claims documents</span>
          <input
            id={`${p}-claims`}
            name={`${p}Claims`}
            type="file"
            multiple
            className="text-xs text-zinc-400 file:mr-3 file:border file:border-red-900/40 file:bg-red-950/30 file:px-3 file:py-1.5 file:font-label file:text-[9px] file:uppercase file:tracking-wider file:text-red-200"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = '';
              if (files.length === 0) return;
              const next = [...value.claimsFiles, ...files];
              setClaimsFiles(next);
              onClaimsFileChange?.(files);
            }}
          />
          <DocumentPreviewList
            title="Claims previews"
            files={value.claimsFiles}
            previewUrls={claimsPreviewUrls}
            onRemove={(index) => {
              setClaimsFiles(value.claimsFiles.filter((_, i) => i !== index));
            }}
          />
        </label>
        <label className="block space-y-2 p-4 border border-dashed border-red-950/50 bg-[#030203]/80 hover:border-red-900/50 cursor-pointer">
          <span className="font-label text-[10px] uppercase tracking-widest text-red-400/90">Inspections documents</span>
          <input
            id={`${p}-inspections`}
            name={`${p}Inspections`}
            type="file"
            multiple
            className="text-xs text-zinc-400 file:mr-3 file:border file:border-red-900/40 file:bg-red-950/30 file:px-3 file:py-1.5 file:font-label file:text-[9px] file:uppercase file:tracking-wider file:text-red-200"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = '';
              if (files.length === 0) return;
              const next = [...value.inspectionFiles, ...files];
              setInspectionFiles(next);
              onInspectionFileChange?.(files);
            }}
          />
          <DocumentPreviewList
            title="Inspections previews"
            files={value.inspectionFiles}
            previewUrls={inspectionPreviewUrls}
            onRemove={(index) => {
              setInspectionFiles(value.inspectionFiles.filter((_, i) => i !== index));
            }}
          />
        </label>
      </div>
    </section>
  );
}
