import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { nonVendorQueries } from "@/queries/non-vendor.queries";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SettlementDetailCard } from "@/components/settlement/settlement-detail-card";
import { getNonVendorRequestFilePreview } from "@/api/non-vendor.api";
import { toast } from "sonner";
import ToastError from "@/components/toast/toast-error";
import { queryClient } from "@/queries/queryClient";

export const Route = createFileRoute("/_non-vendor/settlements/$id/detail")({
  loader: ({ params }) =>
    queryClient.ensureQueryData(nonVendorQueries.requestDetail(params.id)),
  component: SettlementDetailPage,
  staticData: {
    breadcrumb: "breadcrumb.settlementDetail",
  },
});

function SettlementDetailPage() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery(
    nonVendorQueries.requestDetail(id),
  );
  const requestData = response?.data;

  const handlePreview = async (filename: string) => {
    try {
      toast.loading(t("admin.loadingDocumentPreview"), { id: "preview-loading" });
      const blob = await getNonVendorRequestFilePreview(filename);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      toast.dismiss("preview-loading");
    } catch (error) {
      toast.dismiss("preview-loading");
      toast(<ToastError message={t("admin.failedLoadDocumentPreview")} />);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse text-slate-500">
        {t("settlement.loadingDetails")}
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="p-8 text-center text-slate-500">
        {t("settlement.dataNotFound")}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/settlements" })}
          className="rounded-full h-10 w-10 shrink-0 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:text-main transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader
          title={t("settlement.detail")}
          subtitle={`Invoice #${requestData.number}`}
          className="border-none pb-0 mb-0"
        />
      </div>

      <SettlementDetailCard
        settleStatus={requestData.settleStatus}
        settleStatusLabel={requestData.settleStatusLabel}
        settleAmount={requestData.settleAmount}
        settleNote={requestData.settleNote}
        settlePaymentType={requestData.settlePaymentType}
        settlementDocPath={requestData.settlementDocPath}
        settlementDocPath2={requestData.settlementDocPath2}
        settlementTransferDocPath={requestData.settlementTransferDocPath}
        onPreview={handlePreview}
      />
    </div>
  );
}
