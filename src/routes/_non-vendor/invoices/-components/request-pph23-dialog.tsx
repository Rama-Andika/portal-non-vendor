import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface RequestPph23DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function RequestPph23Dialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: RequestPph23DialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onConfirm={onConfirm}
      isLoading={isLoading}
      title={t("invoice.requestPph23Title")}
      description={t("invoice.requestPph23Desc")}
      confirmText={t("invoice.requestPph23Confirm")}
      cancelText={t("common.cancel")}
      variant="primary"
    />
  );
}
