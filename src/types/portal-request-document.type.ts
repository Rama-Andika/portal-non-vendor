/**
 * A supporting document that has been saved on the server.
 * Follows the response format of the endpoint:
 * GET /rest/portal/non-vendor/portal-requests/{id}/documents
 */
export interface PortalRequestDocument {
  /** Document ID. Sent as a string from the backend, do not cast to number. */
  id: string;
  /** Original file name when uploaded, e.g., "invoice.pdf". */
  originalName: string;
  /** File size in bytes. */
  fileSize: number;
  /** Upload timestamp, format "yyyy-MM-dd HH:mm:ss". Ready to display. */
  uploadedAt: string;
}

/**
 * A file selected by the user but NOT yet sent to the server (staging).
 */
export interface StagedDocument {
  /** Local ID, used only for React keys and removing from staging. */
  localId: string;
  /** File object from file input or drag-and-drop. */
  file: File;
}
