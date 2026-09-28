import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Banknote,
  FileText,
  CreditCard,
  Eye,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SettleStatus,
  settleStatusColorMap,
  getPaymentTypeLabel,
} from "@/types/settlement.type";
import { formatCurrency } from "@/utils/format-currency";

interface SettlementDetailCardProps {
  settleStatus: number;
  settleStatusLabel?: string;
  settleAmount?: number;
  settleNote?: string;
  settlePaymentType?: number;
  settlementDocPath?: string | null;
  settlementDocPath2?: string | null;
  settlementTransferDocPath?: string | null;
  onPreview?: (filename: string) => void;
}

export function SettlementDetailCard({
  settleStatus,
  settleStatusLabel,
  settleAmount,
  settleNote,
  settlePaymentType,
  settlementDocPath,
  settlementDocPath2,
  settlementTransferDocPath,
  onPreview,
}: SettlementDetailCardProps) {
  const { t } = useTranslation();

  // Only show if not UNSETTLE (0)
  if (settleStatus === SettleStatus.UNSETTLE || settleStatus === undefined)
    return null;

  const statusConfig: Record<
    number,
    { icon: React.ComponentType<{ className?: string }> }
  > = {
    [SettleStatus.SUBMITTED]: { icon: Clock },
    [SettleStatus.COMPLETED]: { icon: CheckCircle2 },
    [SettleStatus.REJECTED]: { icon: XCircle },
  };

  const config = statusConfig[settleStatus] || { icon: AlertCircle };
  const StatusIcon = config.icon;
  const colors = settleStatusColorMap[settleStatus] || {
    bg: "#f3f4f6",
    text: "#374151",
  };

  const documents = [
    { label: t("settlement.mainDocRequired"), path: settlementDocPath },
    { label: t("settlement.transferProofRequired"), path: settlementTransferDocPath },
    { label: t("settlement.additionalDocOptional"), path: settlementDocPath2 },
  ].filter((d) => !!d.path);

  return (
    <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 py-4 px-6 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-main/10 flex items-center justify-center text-main">
            <Banknote className="w-5 h-5" />
          </div>
          <CardTitle className="text-sm font-semibold uppercase tracking-tight">
            {t("settlement.infoTitle")}
          </CardTitle>
        </div>
        <Badge
          style={{ backgroundColor: colors.bg, color: colors.text }}
          className="px-2.5 py-1 uppercase text-[10px] font-semibold shadow-none border border-transparent flex items-center gap-1.5"
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {settleStatusLabel || "Unknown Status"}
        </Badge>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {t("settlement.settleAmount")}
              </span>
              <span className="text-3xl font-bold text-main">
                {formatCurrency(settleAmount || 0)}
              </span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                  {t("settlement.paymentTypeLabel")}
                </span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase">
                  {getPaymentTypeLabel(settlePaymentType)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-slate-500">
              <FileText className="w-4 h-4" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                {t("settlement.notesRemarks")}
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/40 min-h-[100px] flex items-start">
              <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
                {settleNote
                  ? `"${settleNote}"`
                  : t("settlement.noNotesProvided")}
              </p>
            </div>
          </div>
        </div>

        {documents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-500 border-b pb-2">
              <Paperclip className="w-4 h-4" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                {t("settlement.documents")}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 group hover:border-main/40 transition-all"
                >
                  <div className="flex items-center gap-3 truncate">
                    <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className="text-[9px] font-semibold uppercase text-slate-400 leading-tight">
                        {doc.label}
                      </span>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">
                        {doc.path}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-main hover:bg-main/10 transition-all active:scale-90"
                    onClick={() => doc.path && onPreview?.(doc.path)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
