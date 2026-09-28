import { ShieldOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  DOCUMENT_STATUS_COLOR,
  type DocumentStatusType,
} from "@/enums/document-status.enum";

interface AccessRestrictedProps {
  status: string;
  featureName: string;
}

export function AccessRestricted({ status, featureName }: AccessRestrictedProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const statusColor = DOCUMENT_STATUS_COLOR[status as DocumentStatusType] ?? {
    bg: "#f1f5f9",
    text: "#64748b",
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] px-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full text-center space-y-6">

        {/* Visual Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-sm">
            <ShieldOffIcon className="w-10 h-10 text-amber-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">
            {featureName} {t("accessRestricted.accessRestrictedTitle")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("accessRestricted.accessRestrictedDesc", { feature: featureName })}
          </p>
        </div>

        {/* Current Account Status Badge */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            {t("accessRestricted.currentAccountStatus")}
          </p>
          <span
            className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide"
            style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
          >
            {status}
          </span>
        </div>

        {/* Contact Admin Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 leading-relaxed">
          {t("accessRestricted.contactAdminDesc")}
        </div>

        {/* Navigation Button to Company */}
        <Button
          onClick={() => navigate({ to: "/company" })}
          className="w-full h-11 bg-main hover:bg-main/90 text-white shadow-lg transition-all active:scale-95 rounded-xl"
        >
          {t("accessRestricted.viewCompanyProfile")}
        </Button>

      </div>
    </div>
  );
}
