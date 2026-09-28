import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

interface RevisionBannerProps {
  reason: string;
}

export function RevisionBanner({ reason }: RevisionBannerProps) {
  const { t } = useTranslation();
  if (!reason) return null;

  return (
    <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 mb-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
      <AlertCircle className="h-5 w-5 text-red-600" />
      <AlertTitle className="font-semibold text-red-800 text-base">
        {t("accessRestricted.revisionActionRequiredTitle")}
      </AlertTitle>
      <AlertDescription className="mt-3 text-sm flex flex-col gap-2">
        <p>{t("accessRestricted.revisionReasonNotice")}</p>
        <div className="p-3 bg-white rounded-md border border-red-100 font-medium text-gray-800 italic">
          "{reason}"
        </div>
        <p className="font-medium mt-1">
          {t("accessRestricted.revisionCorrectInstruction")}
        </p>
      </AlertDescription>
    </Alert>
  );
}
