export const DOCUMENT_STATUS = {
  DRAFT: "DRAFT",
  APPROVED: "APPROVED",
  WAITING_APPROVAL: "WAITING_APPROVAL",
  CANCELLED: "CANCELLED",
  PAID: "PAID",
  VERIFIED: "VERIFIED",
  UPLOADED: "UPLOADED",
  PENDING: "PENDING",
  TERMINATED: "TERMINATED",
  SETTLEMENT: "SETTLEMENT",
  REVISION: "REVISION",
  CHECKED: "CHECKED",
  REJECTED: "REJECTED",
} as const;

export type DocumentStatusType =
  (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

export const DOCUMENT_STATUS_COLOR: Record<
  DocumentStatusType,
  { bg: string; text: string }
> = {
  [DOCUMENT_STATUS.DRAFT]: {
    bg: "#E2E8F0", // slate-200
    text: "#475569", // slate-600
  },

  [DOCUMENT_STATUS.PENDING]: {
    bg: "#FEF3C7", // amber-100
    text: "#92400E", // amber-800
  },
  [DOCUMENT_STATUS.WAITING_APPROVAL]: {
    bg: "#FEF3C7", // amber-100
    text: "#92400E", // amber-800
  },

  [DOCUMENT_STATUS.APPROVED]: {
    bg: "#DCFCE7", // green-100
    text: "#166534", // green-800
  },

  [DOCUMENT_STATUS.VERIFIED]: {
    bg: "#E0F2FE", // sky-100
    text: "#075985", // sky-800
  },

  [DOCUMENT_STATUS.PAID]: {
    bg: "#D1FAE5", // emerald-100
    text: "#065F46", // emerald-800
  },

  [DOCUMENT_STATUS.UPLOADED]: {
    bg: "#E0E7FF", // indigo-100
    text: "#3730A3", // indigo-800
  },

  [DOCUMENT_STATUS.CANCELLED]: {
    bg: "#FEE2E2", // red-100
    text: "#991B1B", // red-800
  },

  [DOCUMENT_STATUS.TERMINATED]: {
    bg: "#E7E5E4", // stone-200
    text: "#7C2D12", // dark brown / red
  },

  [DOCUMENT_STATUS.SETTLEMENT]: {
    bg: "#D1FAE5", // emerald-100
    text: "#065F46", // emerald-800
  },
  [DOCUMENT_STATUS.REVISION]: {
    bg: "#FFEDD5", // orange-100
    text: "#9A3412", // orange-800
  },
  [DOCUMENT_STATUS.CHECKED]: {
    bg: "#F5F3FF", // violet-50
    text: "#5B21B6", // violet-800
  },
  [DOCUMENT_STATUS.REJECTED]: {
    bg: "#FEE2E2", // red-100
    text: "#991B1B", // red-800
  }
};
