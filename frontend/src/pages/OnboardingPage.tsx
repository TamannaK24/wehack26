import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { loadUser, saveUser } from '../lib/authStorage';
import {
  DocumentsUploadForm,
  PropertyBlueprintUploadForm,
  PROTECTION_QUIZ_ITEMS,
  ProtectionQuizForm,
  emptyPropertyAddress,
  emptyDocumentUploads,
  emptyProtectionQuizAnswers,
  buildOnboardingPayload,
  type PropertyAddress,
  type DocumentUploads,
  type ProtectionQuizAnswers,
} from '../components/onboarding';

type Step = 'address' | 'documents' | 'quiz' | 'property';

type OnboardingPageProps = {
  onComplete: () => void;
};

type AddressSearchResult = {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:5050').replace(/\/$/, '');

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState<PropertyAddress>(emptyPropertyAddress);
  const [documents, setDocuments] = useState<DocumentUploads>(emptyDocumentUploads);
  const [quiz, setQuiz] = useState<ProtectionQuizAnswers>(() => emptyProtectionQuizAnswers());

  const [addressInput, setAddressInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [claimsUploadStatus, setClaimsUploadStatus] = useState('');
  const [inspectionUploadStatus, setInspectionUploadStatus] = useState('');
  const [documentExtractionStatus, setDocumentExtractionStatus] = useState('');
  const [isExtractingDocuments, setIsExtractingDocuments] = useState(false);
  const [propertyUploadStatus, setPropertyUploadStatus] = useState('');
  const [photoExtractionStatus, setPhotoExtractionStatus] = useState('');
  const blurTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const query = addressInput.trim();

    if (!showDropdown || !query) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError('');
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');

      try {
        const response = await fetch(
          `${API_BASE_URL || ''}/addresses/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Address search failed with status ${response.status}`);
        }

        const results = (await response.json()) as AddressSearchResult[];
        setSearchResults(results);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Address search failed', error);
        setSearchResults([]);
        setSearchError('Unable to load addresses right now. Make sure the backend is running.');
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [addressInput, showDropdown]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectAddress = (selected: AddressSearchResult) => {
    setAddressInput(selected.label);
    setShowDropdown(false);
    setSelectedAddressId(selected.id);
    setSearchResults([]);
    setSearchError('');

    setAddress({
      street: selected.street,
      city: selected.city,
      state: selected.state,
      zip: selected.zip,
    });

    void fetch(`${API_BASE_URL || ''}/addresses/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addressId: selected.id }),
    }).catch((error) => {
      console.error('Saving selected address failed', error);
    });
  };

  const handleAddressInputChange = (value: string) => {
    setAddressInput(value);
    setShowDropdown(true);
    setSelectedAddressId('');
    setSearchError('');
    setAddress(emptyPropertyAddress());
  };

  const uploadDocument = async (
    file: File,
    endpoint: string,
    setStatus: (message: string) => void,
    label: string,
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    setStatus(`Uploading ${label}...`);

    try {
      const response = await fetch(`${API_BASE_URL || ''}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`${label} upload failed with status ${response.status}`);
      }

      setStatus(`${label} uploaded.`);
    } catch (error) {
      console.error(`${label} upload failed`, error);
      setStatus(`${label} upload failed.`);
    }
  };

  const handleClaimsFileChange = (files: File[]) => {
    if (files.length === 0) {
      setClaimsUploadStatus('');
      return;
    }

    setClaimsUploadStatus(`Uploading ${files.length} claims file${files.length === 1 ? '' : 's'}...`);

    void Promise.all(files.map((file) => uploadDocument(file, '/claims', () => undefined, 'Claims file')))
      .then(() => {
        setClaimsUploadStatus(`Uploaded ${files.length} claims file${files.length === 1 ? '' : 's'}.`);
      })
      .catch(() => {
        setClaimsUploadStatus('Some claims files failed to upload.');
      });
  };

  const handleInspectionFileChange = (files: File[]) => {
    if (files.length === 0) {
      setInspectionUploadStatus('');
      return;
    }

    setInspectionUploadStatus(`Uploading ${files.length} inspection file${files.length === 1 ? '' : 's'}...`);

    void Promise.all(files.map((file) => uploadDocument(file, '/inspections', () => undefined, 'Inspection file')))
      .then(() => {
        setInspectionUploadStatus(`Uploaded ${files.length} inspection file${files.length === 1 ? '' : 's'}.`);
      })
      .catch(() => {
        setInspectionUploadStatus('Some inspection files failed to upload.');
      });
  };

  const finish = () => {
    const payload = buildOnboardingPayload(address, documents, quiz);
    void payload;
    const quizPayload = {
      responses: PROTECTION_QUIZ_ITEMS.map((item) => ({
        id: item.id,
        question: item.label,
        answer: typeof quiz[item.id] === 'number' ? quiz[item.id] : 0,
      })),
    };

    const propertyUploads: Promise<unknown>[] = [];

    const hasPropertyUploads = Boolean(documents.blueprintFile) || documents.propertyPhotos.length > 0;

    if (hasPropertyUploads) {
      setPropertyUploadStatus('Uploading floor plan and photos...');
      setPhotoExtractionStatus('');
    }

    if (documents.blueprintFile) {
      propertyUploads.push(
        uploadDocument(documents.blueprintFile, '/blueprints', () => undefined, 'Blueprint file'),
      );
    }

    for (const photo of documents.propertyPhotos) {
      propertyUploads.push(uploadDocument(photo, '/photos', () => undefined, 'Property photo'));
    }

    void Promise.all([
      ...propertyUploads,
      fetch(`${API_BASE_URL || ''}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizPayload),
      }),
    ])
      .then(async () => {
        if (hasPropertyUploads) {
          setPropertyUploadStatus('Floor plan and photos uploaded.');
        }

        if (documents.propertyPhotos.length > 0) {
          setPhotoExtractionStatus('Extracting homeowner risk from uploaded property photos...');
          const response = await fetch(`${API_BASE_URL || ''}/photos/extract-risk`, {
            method: 'POST',
          });
          const data = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(data.error || `Photo extraction failed with status ${response.status}`);
          }
          setPhotoExtractionStatus('Photo risk extraction complete and saved to final.json.');
        }
      })
      .catch((error) => {
        console.error('Onboarding completion failed', error);
        if (hasPropertyUploads) {
          setPropertyUploadStatus('Some property uploads failed.');
        }
        if (documents.propertyPhotos.length > 0) {
          setPhotoExtractionStatus(
            error instanceof Error ? error.message : 'Photo extraction failed.',
          );
        }
      })
      .finally(() => {
        const user = loadUser();
        if (user) {
          saveUser({ ...user, onboardingComplete: true });
        }
        onComplete();
      });
  };

  const stepIndex =
    step === 'address' ? 0 : step === 'documents' ? 1 : step === 'quiz' ? 2 : 3;

  return (
    <div className="relative max-w-3xl mx-auto px-4 py-8">
      <div
        className="absolute inset-0 -z-10 rounded-sm opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(127, 29, 29, 0.25) 0%, transparent 50%), linear-gradient(180deg, transparent 0%, #030203 100%)',
        }}
      />

      <header className="mb-10 border-l-2 border-red-800/50 pl-6">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-red-400/90 mb-2">Onboarding</p>
        <h1 className="font-headline text-4xl md:text-5xl uppercase tracking-tight text-white">
          Property <span className="text-red-400">intake</span>
        </h1>
        <p className="mt-3 text-zinc-400 text-sm max-w-xl">
          Four quick steps: confirm the site, file documents, complete the protection checklist, then optionally add a
          blueprint or property photos — you can skip anything for now.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {(['Address', 'Documents', 'Quiz', 'Blueprint'] as const).map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-2 font-label text-[9px] uppercase tracking-widest px-3 py-1.5 border ${
                i === stepIndex
                  ? 'border-red-500/50 bg-red-950/30 text-red-200'
                  : i < stepIndex
                  ? 'border-red-900/40 text-zinc-500'
                  : 'border-red-950/30 text-zinc-600'
              }`}
            >
              {i < stepIndex ? (
                <CheckCircle2 size={12} className="text-red-400/80" />
              ) : (
                <span className="text-zinc-600">{i + 1}</span>
              )}
              {label}
            </div>
          ))}
        </div>
      </header>

      {step === 'address' && (
        <>
          <div className="relative">
            <label className="block text-sm text-zinc-300 mb-2">Property Address</label>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => {
                handleAddressInputChange(e.target.value);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                blurTimeoutRef.current = window.setTimeout(() => {
                  setShowDropdown(false);
                }, 150);
              }}
              placeholder="Start typing an address..."
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-500"
            />

            {showDropdown && (
              <div className="absolute z-20 mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 shadow-lg max-h-60 overflow-y-auto">
                {!addressInput.trim() && (
                  <div className="px-4 py-3 text-sm text-zinc-500">Type to search for an address.</div>
                )}

                {addressInput.trim() && isSearching && (
                  <div className="px-4 py-3 text-sm text-zinc-400">Searching addresses...</div>
                )}

                {addressInput.trim() && !isSearching && searchError && (
                  <div className="px-4 py-3 text-sm text-red-300">{searchError}</div>
                )}

                {addressInput.trim() &&
                  !isSearching &&
                  !searchError &&
                  searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectAddress(item)}
                      className="block w-full px-4 py-3 text-left text-sm text-zinc-200 hover:bg-red-950/40"
                    >
                      {item.label}
                    </button>
                  ))}

                {addressInput.trim() &&
                  !isSearching &&
                  !searchError &&
                  searchResults.length === 0 && (
                    <div className="px-4 py-3 text-sm text-zinc-500">No matching addresses found.</div>
                  )}
              </div>
            )}
          </div>

          {!selectedAddressId && addressInput.trim() && (
            <p className="mt-2 text-sm text-zinc-500">Choose one of the search results to continue.</p>
          )}

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => setStep('documents')}
              disabled={!selectedAddressId}
              className="inline-flex items-center gap-2 border border-red-800/50 bg-red-950/40 px-6 py-3 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-red-100 hover:bg-red-900/50"
            >
              Continue
              <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}

      {step === 'documents' && (
        <>
          <DocumentsUploadForm
            value={documents}
            onChange={setDocuments}
            onClaimsFileChange={handleClaimsFileChange}
            onInspectionFileChange={handleInspectionFileChange}
          />
          {(claimsUploadStatus || inspectionUploadStatus || documentExtractionStatus) && (
            <div className="mt-4 space-y-1 text-sm text-zinc-400">
              {claimsUploadStatus && <p>{claimsUploadStatus}</p>}
              {inspectionUploadStatus && <p>{inspectionUploadStatus}</p>}
              {documentExtractionStatus && <p>{documentExtractionStatus}</p>}
            </div>
          )}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep('address')}
              className="inline-flex items-center gap-2 text-zinc-500 font-label text-[10px] uppercase tracking-widest hover:text-red-300"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (documents.claimsFiles.length === 0 && documents.inspectionFiles.length === 0) {
                  setDocumentExtractionStatus('');
                  setStep('quiz');
                  return;
                }

                setIsExtractingDocuments(true);
                setDocumentExtractionStatus('Extracting homeowner risk from uploaded claim and inspection documents...');

                void fetch(`${API_BASE_URL || ''}/documents/extract-risk`, {
                  method: 'POST',
                })
                  .then(async (response) => {
                    const data = (await response.json()) as { error?: string };
                    if (!response.ok) {
                      throw new Error(data.error || `Extraction failed with status ${response.status}`);
                    }
                    setDocumentExtractionStatus('Risk extraction complete and saved to final.json.');
                    setStep('quiz');
                  })
                  .catch((error) => {
                    console.error('Document extraction failed', error);
                    setDocumentExtractionStatus(
                      error instanceof Error ? error.message : 'Document extraction failed.',
                    );
                  })
                  .finally(() => {
                    setIsExtractingDocuments(false);
                  });
              }}
              disabled={isExtractingDocuments}
              className="inline-flex items-center gap-2 border border-red-800/50 bg-red-950/40 px-6 py-3 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-red-100 hover:bg-red-900/50"
            >
              {isExtractingDocuments ? 'Extracting...' : 'Continue'}
              <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}

      {step === 'quiz' && (
        <>
          <ProtectionQuizForm value={quiz} onChange={setQuiz} />
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-6 pt-4 border-t border-red-950/25">
            <button
              type="button"
              onClick={() => setStep('documents')}
              className="inline-flex items-center gap-2 text-zinc-500 font-label text-[10px] uppercase tracking-widest hover:text-red-300 self-start"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep('property')}
              className="inline-flex items-center justify-center gap-2 border border-red-800/50 bg-red-950/40 px-8 py-3 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-red-100 hover:bg-red-900/50"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}

      {step === 'property' && (
        <>
          <PropertyBlueprintUploadForm value={documents} onChange={setDocuments} />
          {propertyUploadStatus && <p className="mt-4 text-sm text-zinc-400">{propertyUploadStatus}</p>}
          {photoExtractionStatus && <p className="mt-2 text-sm text-zinc-400">{photoExtractionStatus}</p>}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-6 pt-4 border-t border-red-950/25">
            <button
              type="button"
              onClick={() => setStep('quiz')}
              className="inline-flex items-center gap-2 text-zinc-500 font-label text-[10px] uppercase tracking-widest hover:text-red-300 self-start"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <button
              type="button"
              onClick={finish}
              className="inline-flex items-center justify-center gap-2 border border-red-800/50 bg-red-950/40 px-8 py-3 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-red-100 hover:bg-red-900/50"
            >
              Complete intake
              <CheckCircle2 size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
