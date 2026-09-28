import { useCanGoBack, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";
import { useAdminAuthStore } from "@/stores/admin-auth.store";

export default function NotFound() {
  const { t } = useTranslation();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { authenticated: isNonVendor } = useNonVendorAuthStore();
  const { authenticated: isAdmin } = useAdminAuthStore();

  const handleGoBack = () => {
    if (canGoBack) {
      router.history.back();
    } else {
      // Fallback based on auth state, avoiding "/"
      if (isAdmin) {
        router.navigate({ to: "/admin/dashboard" });
      } else if (isNonVendor) {
        router.navigate({
          to: "/invoices",
          search: {
            page: 0,
            size: 10,
            sortBy: "date",
            sortOrder: "desc",
          },
        });
      } else {
        router.navigate({
          to: "/login",
          search: { redirect: "/invoices" },
        });
      }
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 px-6">
      <div className="text-center max-w-xl">
        {/* 404 Number */}
        <h1 className="text-[120px] md:text-[160px] font-extrabold text-gray-300 dark:text-gray-700 leading-none select-none">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          {t("notFound.title") || "Page Not Found"}
        </h2>

        {/* Description */}
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          {t("notFound.desc") ||
            "Sorry, the page you are looking for doesn’t exist or has been moved."}
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleGoBack}>{t("common.back")}</Button>

          <p className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300">
            {t("notFound.contactSupport") || "Contact Support"}
          </p>
        </div>
      </div>
    </div>
  );
}
