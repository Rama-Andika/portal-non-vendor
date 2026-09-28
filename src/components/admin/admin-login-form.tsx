import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldError } from "../ui/field";
import { Input } from "@/components/ui/input";
import { useRouter, getRouteApi } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  type LoginFormValues,
} from "@/validation/login.validation";
import { useAdminLoginMutation } from "@/queries/admin.queries";
import ToastError from "@/components/toast/toast-error";
import getErrorMessage from "@/utils/error-message";
import type { AxiosError } from "axios";
import { Shield, Lock, User as UserIcon, Loader2, Eye, EyeOff } from "lucide-react";
import { useAdminAuthStore } from "@/stores/admin-auth.store";
import { toast } from "sonner";
import ToastSuccess from "../toast/toast-success";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

const routeApi = getRouteApi("/admin-login/");

interface Props {
  className?: string;
}

export function AdminLoginForm({ className }: Props) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const search = routeApi.useSearch();
  const { signIn } = useAdminAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { mutate: login, isPending } = useAdminLoginMutation();

  const onSubmit = (data: LoginFormValues) => {
    login(data, {
      onSuccess: (response) => {
        if (response.data) {
          signIn(response.data);
          toast(<ToastSuccess message="Welcome back!" />);
          router.invalidate();
          router.history.push(search.redirect || "/admin/dashboard");
        }
      },
      onError: (err) => {
        const message = getErrorMessage(err as AxiosError);
        toast(
          <ToastError
            message={message || "Login failed. Please check your credentials."}
          />,
        );
      },
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex justify-end">
        <LanguageSwitcher variant="ghost" size="sm" />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <div className="size-14 rounded-2xl bg-main/10 flex items-center justify-center mb-2">
          <Shield className="size-8 text-main" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">{t("adminAccess")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("portalNonVendorManagement")}
          </p>
        </div>
      </div>

      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="username">{t("username")}</FieldLabel>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                id="username"
                placeholder={t("username")}
                className="pl-10 h-11 focus-visible:ring-main"
                {...register("username")}
              />
            </div>
            <FieldError>{errors.username?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("password")}
                className="pl-10 pr-10 h-11 focus-visible:ring-main"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-main transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <FieldError>{errors.password?.message}</FieldError>
          </Field>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-main hover:bg-main/90 text-white font-semibold rounded-xl shadow-lg shadow-main/20 transition-all active:scale-[0.98]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("authenticating")}
              </>
            ) : (
              t("authenticateAsAdmin")
            )}
          </Button>
        </FieldGroup>
      </form>

      <div className="text-center">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          {t("authorizedPersonnelOnly")}
        </p>
      </div>
    </div>
  );
}
