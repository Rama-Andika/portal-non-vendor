import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import AutoLogout from "@/autoLogout";
import { useTranslation } from "react-i18next";

function ErrorComponent({ error }: { error: Error }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 text-slate-800">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mb-2">{t("app.appErrorTitle")}</h1>
        <p className="text-sm text-slate-500 mb-6">
          {t("app.appErrorDesc")}
        </p>
        <pre className="p-3 bg-slate-50 rounded-lg text-xs w-full overflow-hidden text-left text-slate-400 mb-6 border border-slate-100 max-h-24 overflow-y-auto">
          {error.message || "Unknown error occurred"}
        </pre>
        <button 
          onClick={() => {
            window.location.reload();
          }}
          className="w-full py-3 px-4 bg-main text-white rounded-xl font-medium shadow-md hover:opacity-90 transition-all active:scale-95"
        >
          {t("app.reloadApp")}
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Outlet />
        <AutoLogout />
        <TanStackRouterDevtools position="top-right" />
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
          buttonPosition="bottom-right"
        />
      </>
    );
  },
  errorComponent: ErrorComponent,
});
