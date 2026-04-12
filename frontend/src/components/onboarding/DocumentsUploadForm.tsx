import { FileUp } from 'lucide-react';
import type { DocumentUploads } from './types';

export type DocumentsUploadFormProps = {
  value: DocumentUploads;
  onChange: (next: DocumentUploads) => void;
  idPrefix?: string;
};

export function DocumentsUploadForm({ value, onChange, idPrefix = 'docs' }: DocumentsUploadFormProps) {
  const p = idPrefix;
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
          <span className="font-label text-[10px] uppercase tracking-widest text-red-400/90">Claims document</span>
          <input
            id={`${p}-claims`}
            name={`${p}Claims`}
            type="file"
            className="text-xs text-zinc-400 file:mr-3 file:border file:border-red-900/40 file:bg-red-950/30 file:px-3 file:py-1.5 file:font-label file:text-[9px] file:uppercase file:tracking-wider file:text-red-200"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={(e) =>
              onChange({ ...value, claimsFile: e.target.files?.[0] ?? null })
            }
          />
          {value.claimsFile && <p className="text-xs text-zinc-500 truncate">{value.claimsFile.name}</p>}
        </label>
        <label className="block space-y-2 p-4 border border-dashed border-red-950/50 bg-[#030203]/80 hover:border-red-900/50 cursor-pointer">
          <span className="font-label text-[10px] uppercase tracking-widest text-red-400/90">Inspections document</span>
          <input
            id={`${p}-inspections`}
            name={`${p}Inspections`}
            type="file"
            className="text-xs text-zinc-400 file:mr-3 file:border file:border-red-900/40 file:bg-red-950/30 file:px-3 file:py-1.5 file:font-label file:text-[9px] file:uppercase file:tracking-wider file:text-red-200"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={(e) =>
              onChange({ ...value, inspectionFile: e.target.files?.[0] ?? null })
            }
          />
          {value.inspectionFile && (
            <p className="text-xs text-zinc-500 truncate">{value.inspectionFile.name}</p>
          )}
        </label>
      </div>
    </section>
  );
}
