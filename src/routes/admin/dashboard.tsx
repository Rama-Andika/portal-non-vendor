import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

function AdminDashboardComponent() {
  const { t } = useTranslation();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t("admin.dashboardTitle")}</h1>
      <p className="text-muted-foreground mt-2">{t("admin.dashboardWelcome")}</p>
    </div>
  );
}

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardComponent,
});
