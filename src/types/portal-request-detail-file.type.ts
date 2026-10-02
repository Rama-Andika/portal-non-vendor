/**
 * A file selected by the user for one invoice line item (detail) but NOT yet
 * sent to the server, because that line item does not have a server ID yet.
 *
 * Happens in two situations:
 * 1. Create mode: the invoice (and therefore its details) does not exist yet.
 * 2. Edit mode: the user just added a new row, so its ID is still a
 *    frontend-generated UUID.
 */
export interface StagedDetailFile {
  /** Form item ID. A frontend-generated UUID while the row is unsaved. */
  itemId: string;
  /** File object from the file input or from drag-and-drop. */
  file: File;
}
