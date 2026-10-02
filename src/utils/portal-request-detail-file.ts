import type { StagedDetailFile } from "@/types/portal-request-detail-file.type";

/** Maximum size of one line item file: 2 MB. */
export const MAX_DETAIL_FILE_SIZE_BYTES = 2 * 1024 * 1024;

/** The only MIME type accepted by the backend. */
export const ACCEPTED_DETAIL_FILE_MIME = "application/pdf";

/**
 * Validation error types. Defined as a literal union so the i18n message
 * mapping in components is fully type-checked by TypeScript.
 */
export type DetailFileValidationError =
  | { type: "pdfOnly" }
  | { type: "emptyFile"; name: string }
  | { type: "maxSize"; name: string };

/**
 * Validates one file against the backend rules before any request is sent.
 * Returns null when the file is valid.
 */
export function validateDetailFile(file: File): DetailFileValidationError | null {
  if (file.type !== ACCEPTED_DETAIL_FILE_MIME) {
    return { type: "pdfOnly" };
  }
  if (file.size === 0) {
    return { type: "emptyFile", name: file.name };
  }
  if (file.size > MAX_DETAIL_FILE_SIZE_BYTES) {
    return { type: "maxSize", name: file.name };
  }
  return null;
}

/** Reads the staged file of one line item, or undefined when it has none. */
export function getStagedDetailFile(
  list: StagedDetailFile[],
  itemId: string,
): File | undefined {
  return list.find((staged) => staged.itemId === itemId)?.file;
}

/**
 * Adds or replaces the staged file of one line item.
 * One line item holds at most one file, mirroring the backend.
 */
export function setStagedDetailFile(
  list: StagedDetailFile[],
  itemId: string,
  file: File,
): StagedDetailFile[] {
  const exists = list.some((staged) => staged.itemId === itemId);
  if (exists) {
    return list.map((staged) =>
      staged.itemId === itemId ? { itemId, file } : staged,
    );
  }
  return [...list, { itemId, file }];
}

/** Removes the staged file of one line item. */
export function removeStagedDetailFile(
  list: StagedDetailFile[],
  itemId: string,
): StagedDetailFile[] {
  return list.filter((staged) => staged.itemId !== itemId);
}

/** Line item as it was submitted to the server, in payload order. */
export interface SubmittedDetailItem {
  id?: string;
  description: string;
  invoiceNumber?: string;
  price: number;
}

/** Line item as returned by the server after create/update. */
export interface ServerDetailItem {
  id: string;
  description: string;
  invoiceNumber?: string | null;
  price: number;
}

/** One staged file that is ready to be uploaded to a real server detail ID. */
export interface DetailUploadTarget {
  /** 1-based row number, used only for user-facing messages. */
  number: number;
  detailId: string;
  file: File;
}

export interface ResolveDetailUploadTargetsArgs {
  /** Items just sent to the server, in the same order as the `details` payload. */
  submittedItems: SubmittedDetailItem[];
  /** Details freshly fetched from the server, in the order the server returned. */
  serverDetails: ServerDetailItem[];
  /** Files currently held in staging. */
  staged: StagedDetailFile[];
}

export interface ResolveDetailUploadTargetsResult {
  targets: DetailUploadTarget[];
  /** Row numbers whose file could not be matched to any server detail. */
  unmatchedNumbers: number[];
}

/**
 * Matches staged files to the server detail IDs created by the last save.
 *
 * The server only returns the request ID on create, so the detail IDs have to
 * be read back and matched. Matching is positional (item n -> details[n]),
 * but a position is only accepted when the description also matches, so a
 * reordering server response can never attach a file to the wrong line item.
 * A row that cannot be matched safely is reported in `unmatchedNumbers`
 * instead of being uploaded to a guessed ID.
 */
export function resolveDetailUploadTargets({
  submittedItems,
  serverDetails,
  staged,
}: ResolveDetailUploadTargetsArgs): ResolveDetailUploadTargetsResult {
  const targets: DetailUploadTarget[] = [];
  const unmatchedNumbers: number[] = [];
  const usedDetailIds = new Set<string>();

  submittedItems.forEach((item, index) => {
    const file = item.id ? getStagedDetailFile(staged, item.id) : undefined;
    if (!file) return;

    const number = index + 1;

    // 1. Primary: the detail at the same position, verified by description.
    const byOrder = serverDetails[index];
    if (
      byOrder !== undefined &&
      !usedDetailIds.has(byOrder.id) &&
      byOrder.description === item.description
    ) {
      usedDetailIds.add(byOrder.id);
      targets.push({ number, detailId: byOrder.id, file });
      return;
    }

    // 2. Fallback: exactly one unused detail with identical content.
    const candidates = serverDetails.filter(
      (detail) =>
        !usedDetailIds.has(detail.id) &&
        detail.description === item.description &&
        (detail.invoiceNumber ?? "") === (item.invoiceNumber ?? "") &&
        detail.price === item.price,
    );
    if (candidates.length === 1) {
      const matched = candidates[0];
      usedDetailIds.add(matched.id);
      targets.push({ number, detailId: matched.id, file });
      return;
    }

    // 3. Ambiguous or missing: never guess.
    unmatchedNumbers.push(number);
  });

  return { targets, unmatchedNumbers };
}
