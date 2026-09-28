import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "./ui/field";
import { Input } from "@/components/ui/input";
import { getRouteApi, useNavigate, useRouter, Link } from "@tanstack/react-router";
import { Spinner } from "./ui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/validation/login.validation";
import { useLoginNonVendorMutation } from "@/queries/auth.queries";
import { useNonVendorAuthStore } from "@/stores/non-vendor-auth.store";
import { toast } from "sonner";
import ToastError from "@/components/toast/toast-error";
import ToastSuccess from "@/components/toast/toast-success";
import type { AxiosError } from "axios";
import getErrorMessage from "@/utils/error-message";
import { Eye, EyeOff } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

interface Props {
  className?: string;
}
export function LoginForm({ className }: Props) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const route = getRouteApi("/login");
  const { redirect } = route.useSearch();
  const router = useRouter();
  const navigate = useNavigate();
  const { signIn } = useNonVendorAuthStore();

  const { mutate: loginUser, isPending } = useLoginNonVendorMutation();

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

  const onSubmit = (data: LoginFormValues) => {
    loginUser(
      { username: data.username, password: data.password },
      {
        onSuccess: async (response) => {
          if (response.data) {
            signIn(response.data);
          }

          toast(<ToastSuccess message="Login successful!" />);
          await router.invalidate();
          await navigate({ to: redirect });
        },
        onError: (error) => {
          const message = getErrorMessage(error as AxiosError);
          toast(
            <ToastError message={message || "Username or password is wrong."} />
          );
        },
      }
    );
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="flex justify-end">
        <LanguageSwitcher variant="ghost" size="sm" />
      </div>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t("auth.loginTitle")}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t("auth.loginSubtitle")}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="username">{t("username")}</FieldLabel>
          <Input
            id="username"
            placeholder={t("username")}
            {...register("username")}
          />
          <FieldError>{errors.username?.message}</FieldError>
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("password")}
              className="pr-10"
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
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : t("login")}
          </Button>
        </Field>
        <div className="text-center text-sm">
          {t("auth.dontHaveAccount")}{" "}
          <Link
            to="/sign-up"
            className="underline underline-offset-4 hover:text-main font-semibold transition-colors"
          >
            {t("auth.signUp")}
          </Link>
        </div>
      </FieldGroup>
    </form>
  );
}
