import * as React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangleIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  variant?: "primary" | "destructive" | "warning";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  cancelText,
  confirmText,
  variant = "primary",
  isLoading = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const displayTitle = title || t("common.confirm");
  const displayCancel = cancelText || t("common.cancel");
  const displayConfirm = confirmText || t("common.confirm");
  const variantStyles = {
    primary: "bg-main hover:bg-main/90 shadow-main/20",
    destructive: "bg-destructive hover:bg-destructive/90 shadow-destructive/20",
    warning: "bg-amber-600 hover:bg-amber-700 shadow-amber-200",
  };

  const iconColors = {
    primary: "text-main bg-main/10",
    destructive: "text-destructive bg-destructive/10",
    warning: "text-amber-600 bg-amber-100",
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px] border-none shadow-2xl">
        <AlertDialogHeader>
          <div className={cn(
            "size-12 rounded-full flex items-center justify-center mb-4 mx-auto",
            iconColors[variant]
          )}>
            <AlertTriangleIcon size={24} />
          </div>
          <AlertDialogTitle className="text-center text-xl">{displayTitle}</AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3 pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <AlertDialogCancel 
            disabled={isLoading}
            className="sm:flex-1 h-11 border-main/10 hover:bg-main/5"
          >
            {displayCancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={cn(
              "sm:flex-1 h-11 text-white shadow-lg transition-all active:scale-95",
              variantStyles[variant]
            )}
          >
            {displayConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
