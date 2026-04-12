/**
 * Plain shapes you can map to/from MongoDB. Files are browser-only until upload;
 * use remoteIds after your API stores GridFS/S3 references.
 */

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
  claimsFile: File | null;
  inspectionFile: File | null;
};

export const emptyDocumentUploads = (): DocumentUploads => ({
  claimsFile: null,
  inspectionFile: null,
});

export type ProtectionAnswer = 'yes' | 'no' | null;

/** Keys match stable ids for Mongo fields */
export type ProtectionQuizAnswers = Record<string, ProtectionAnswer>;

/** Payload you might POST to an API or merge into a Mongo document */
export type OnboardingPayload = {
  address: PropertyAddress;
  /** File metadata only — binary upload handled separately */
  documentsMeta: {
    claims: FileMeta | null;
    inspections: FileMeta | null;
  };
  protectionQuiz: ProtectionQuizAnswers;
};

export function fileToMeta(file: File | null): FileMeta | null {
  if (!file) return null;
  return { name: file.name, size: file.size, type: file.type };
}

export function buildOnboardingPayload(
  address: PropertyAddress,
  uploads: DocumentUploads,
  protectionQuiz: ProtectionQuizAnswers,
): OnboardingPayload {
  return {
    address: { ...address },
    documentsMeta: {
      claims: fileToMeta(uploads.claimsFile),
      inspections: fileToMeta(uploads.inspectionFile),
    },
    protectionQuiz: { ...protectionQuiz },
  };
}
