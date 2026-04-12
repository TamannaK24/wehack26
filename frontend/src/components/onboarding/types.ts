/**
 * Plain shapes you can map to/from MongoDB. Files are browser-only until upload;
 * use remoteIds after your API stores GridFS/S3 references.
 */

import { PROTECTION_QUIZ_ITEMS } from './quizItems';

export type PropertyAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

export const emptyPropertyAddress = (): PropertyAddress => ({
  street: '',
  city: '',
  state: '',
  zip: '',
});

/** Serializable file metadata (e.g. after upload, or for display without File) */
export type FileMeta = {
  name: string;
  size: number;
  type: string;
};

export type DocumentUploads = {
  claimsFiles: File[];
  inspectionFiles: File[];
  /** Optional floor plan / blueprint (single file) */
  blueprintFile: File | null;
  /** Optional property photos (multiple) */
  propertyPhotos: File[];
};

export const emptyDocumentUploads = (): DocumentUploads => ({
  claimsFiles: [],
  inspectionFiles: [],
  blueprintFile: null,
  propertyPhotos: [],
});

/** Non-negative whole counts per feature; 0 = not installed / none */
export type ProtectionQuizAnswers = Record<string, number>;

/** Payload you might POST to an API or merge into a Mongo document */
export type OnboardingPayload = {
  address: PropertyAddress;
  /** File metadata only — binary upload handled separately */
  documentsMeta: {
    claims: FileMeta[];
    inspections: FileMeta[];
    blueprint: FileMeta | null;
    propertyPhotos: FileMeta[];
  };
  protectionQuiz: ProtectionQuizAnswers;
};

export function fileToMeta(file: File | null): FileMeta | null {
  if (!file) return null;
  return { name: file.name, size: file.size, type: file.type };
}

function normalizeProtectionQuizAnswers(raw: ProtectionQuizAnswers): ProtectionQuizAnswers {
  const out: ProtectionQuizAnswers = {};
  for (const item of PROTECTION_QUIZ_ITEMS) {
    const v = raw[item.id];
    if (typeof v === 'number' && Number.isFinite(v)) {
      const n = Math.floor(v);
      out[item.id] = n >= 0 ? n : 0;
    } else {
      out[item.id] = 0;
    }
  }
  return out;
}

export function buildOnboardingPayload(
  address: PropertyAddress,
  uploads: DocumentUploads,
  protectionQuiz: ProtectionQuizAnswers,
): OnboardingPayload {
  return {
    address: { ...address },
    documentsMeta: {
      claims: uploads.claimsFiles.map((f) => fileToMeta(f)).filter((m): m is FileMeta => m != null),
      inspections: uploads.inspectionFiles.map((f) => fileToMeta(f)).filter((m): m is FileMeta => m != null),
      blueprint: fileToMeta(uploads.blueprintFile),
      propertyPhotos: uploads.propertyPhotos.map((f) => fileToMeta(f)).filter((m): m is FileMeta => m != null),
    },
    protectionQuiz: normalizeProtectionQuizAnswers(protectionQuiz),
  };
}
