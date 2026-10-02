import type {
  PortalRequestDocument,
  StagedDocument,
} from "@/types/portal-request-document.type";

/** Maximum number of supporting documents per portal request. */
export const MAX_DOCUMENTS_PER_REQUEST = 5;

/** Maximum size of a single file: 2 MB. */
export const MAX_DOCUMENT_SIZE_BYTES = 2 * 1024 * 1024;

/** Maximum total size of all documents per request: 10 MB. */
export const MAX_TOTAL_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

/** The only MIME type accepted by the backend. */
export const ACCEPTED_DOCUMENT_MIME = "application/pdf";

/**
 * Formats bytes into a human-readable string.
 * Example: 204800 -> "200 KB", 1572864 -> "1.5 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;

  // Number() membuang desimal nol, sehingga 10485760 -> "10 MB", bukan "10.0 MB".
  return `${Number((kb / 1024).toFixed(1))} MB`;
}

/**
 * Generates a local ID for a staged file.
 * Follows the same pattern used in invoice-form.tsx.
 */
export function createLocalId(): string {
  return (
    window.crypto?.randomUUID?.() || Math.random().toString(36).substring(2, 9)
  );
}

/**
 * Triggers a browser download of a Blob.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Validation error types. Defined as a literal union type so
 * i18n message mapping in components is fully type-checked by TypeScript.
 */
export type DocumentValidationError =
  | { type: "pdfOnly" }
  | { type: "emptyFile"; name: string }
  | { type: "maxSize"; name: string }
  | { type: "maxCount"; max: number }
  | { type: "maxTotalSize"; maxSize: string };

interface ValidateDocumentSelectionArgs {
  /** Files recently selected or dropped by the user. */
  incoming: File[];
  /** Documents already saved on the server. Empty array in create mode. */
  uploaded: PortalRequestDocument[];
  /** Files currently in staging that have not yet been uploaded. */
  staged: StagedDocument[];
}

interface ValidateDocumentSelectionResult {
  /** Files allowed to enter staging. Empty if there is a validation error. */
  accepted: File[];
  /** First error encountered, or null if all pass. */
  error: DocumentValidationError | null;
}

/**
 * Validates newly selected files against all backend rules.
 *
 * Designed as all-or-nothing like the backend: if any file is invalid,
 * `accepted` is returned empty so no files enter staging.
 */
export function validateDocumentSelection({
  incoming,
  uploaded,
  staged,
}: ValidateDocumentSelectionArgs): ValidateDocumentSelectionResult {
  // 1. Validate each file individually.
  for (const file of incoming) {
    if (file.type !== ACCEPTED_DOCUMENT_MIME) {
      return { accepted: [], error: { type: "pdfOnly" } };
    }
    if (file.size === 0) {
      return { accepted: [], error: { type: "emptyFile", name: file.name } };
    }
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      return { accepted: [], error: { type: "maxSize", name: file.name } };
    }
  }

  // 2. Validate total document count.
  const nextCount = uploaded.length + staged.length + incoming.length;
  if (nextCount > MAX_DOCUMENTS_PER_REQUEST) {
    return {
      accepted: [],
      error: { type: "maxCount", max: MAX_DOCUMENTS_PER_REQUEST },
    };
  }

  // 3. Validate total size of all documents.
  const uploadedSize = uploaded.reduce((acc, doc) => acc + doc.fileSize, 0);
  const stagedSize = staged.reduce((acc, doc) => acc + doc.file.size, 0);
  const incomingSize = incoming.reduce((acc, file) => acc + file.size, 0);

  if (
    uploadedSize + stagedSize + incomingSize >
    MAX_TOTAL_DOCUMENT_SIZE_BYTES
  ) {
    return {
      accepted: [],
      error: {
        type: "maxTotalSize",
        maxSize: formatFileSize(MAX_TOTAL_DOCUMENT_SIZE_BYTES),
      },
    };
  }

  return { accepted: incoming, error: null };
}
