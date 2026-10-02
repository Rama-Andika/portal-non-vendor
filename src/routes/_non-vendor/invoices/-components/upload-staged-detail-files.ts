import type { QueryClient } from "@tanstack/react-query";
import { uploadNonVendorRequestDetailFile } from "@/api/non-vendor.api";
import {
  nonVendorKeys,
  nonVendorQueries,
} from "@/queries/non-vendor.queries";
import type { StagedDetailFile } from "@/types/portal-request-detail-file.type";
import type { InvoiceItemValues } from "@/validation/invoice-form.validation";
import { resolveDetailUploadTargets } from "@/utils/portal-request-detail-file";

export interface UploadStagedDetailFilesArgs {
  /** Portal request ID that already exists on the server. */
  requestId: string;
  /** Items exactly as they were submitted, in payload order. */
  submittedItems: InvoiceItemValues[];
  staged: StagedDetailFile[];
  queryClient: QueryClient;
}

export interface UploadStagedDetailFilesResult {
  /** Row numbers whose upload request failed. */
  failedNumbers: number[];
  /** Row numbers that could not be matched to a server detail ID. */
  unmatchedNumbers: number[];
}

/**
 * Uploads every staged line item file after the invoice has been saved.
 *
 * Shared by the create page and the edit page. It does NOT show any toast:
 * the caller decides the wording, because the context differs.
 */
export async function uploadStagedDetailFiles({
  requestId,
  submittedItems,
  staged,
  queryClient,
}: UploadStagedDetailFilesArgs): Promise<UploadStagedDetailFilesResult> {
  const failedNumbers: number[] = [];

  // staleTime 0 is required: the cached detail was fetched BEFORE this save and
  // does not contain the IDs of the rows that were just created.
  const detailResponse = await queryClient.fetchQuery({
    ...nonVendorQueries.portalRequestDetail(requestId),
    staleTime: 0,
  });
  const serverDetails = detailResponse?.data?.details ?? [];

  const { targets, unmatchedNumbers } = resolveDetailUploadTargets({
    submittedItems,
    serverDetails,
    staged,
  });

  // Sequential on purpose: one failing file must not stop the rest, and the
  // backend is not expected to handle a burst of uploads for one request.
  for (const target of targets) {
    try {
      await uploadNonVendorRequestDetailFile(target.detailId, target.file);
    } catch {
      failedNumbers.push(target.number);
    }
  }

  if (targets.length > 0) {
    await queryClient.invalidateQueries({
      queryKey: nonVendorKeys.portalRequests.detail(requestId),
    });
  }

  return { failedNumbers, unmatchedNumbers };
}
