import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Building2,
  Loader2,
  User,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import type { AxiosError } from "axios";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

import {
  signUpSchema,
  type SignUpFormValues,
} from "@/validation/sign-up.validation";
import { useRegisterNonVendorMutation } from "@/queries/auth.queries";
import getErrorMessage from "@/utils/error-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToastError from "@/components/toast/toast-error";
import ToastSuccess from "@/components/toast/toast-success";
import { BankArrayFormFields } from "@/components/forms/BankArrayFormFields";

export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
});

const COMPANY_TYPES = [
  "PT",
  "CV",
  "Firma",
  "UD",
  "Individual",
  "Others",
] as const;

type StepFieldKeys = keyof SignUpFormValues;

const STEP_1_FIELDS: StepFieldKeys[] = [
  "username",
  "email",
  "password",
  "confirmPassword",
];

const STEP_2_FIELDS: StepFieldKeys[] = [
  "companyName",
  "companyType",
  "otherCompanyType",
  "address",
  "province",
  "city",
  "postalCode",
  "phoneNumber",
  "website",
];

function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: registerUser, isPending } = useRegisterNonVendorMutation();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      companyType: undefined,
      address: "",
      province: "",
      city: "",
      postalCode: "",
      phoneNumber: "",
      website: "",
      banks: [
        {
          beneficiaryName: "",
          bankName: "",
          accountNumber: "",
          branch: "",
          swiftCode: "",
          isPrimary: 1,
        },
      ],
    },
  });

  const handleNextStep = async () => {
    let fieldsToValidate: StepFieldKeys[] = [];
    if (currentStep === 1) {
      fieldsToValidate = STEP_1_FIELDS;
    } else if (currentStep === 2) {
      fieldsToValidate = STEP_2_FIELDS;
    }

    const isValid = await trigger(fieldsToValidate);

    if (currentStep === 1) {
      const pwd = getValues("password");
      const confirmPwd = getValues("confirmPassword");
      if (pwd !== confirmPwd) {
        setError("confirmPassword", {
          type: "custom",
          message: "Passwords do not match",
        });
        return;
      } else {
        clearErrors("confirmPassword");
      }
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = async (targetStep: number) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    if (targetStep === currentStep) return;

    if (currentStep === 1) {
      const isValid = await trigger(STEP_1_FIELDS);
      const pwd = getValues("password");
      const confirmPwd = getValues("confirmPassword");
      
      if (!isValid || pwd !== confirmPwd) {
        if (pwd !== confirmPwd) {
          setError("confirmPassword", {
            type: "custom",
            message: "Passwords do not match",
          });
        }
        return;
      } else {
        clearErrors("confirmPassword");
      }
      
      if (targetStep === 2) {
        setCurrentStep(2);
      } else if (targetStep === 3) {
        const isStep2Valid = await trigger(STEP_2_FIELDS);
        if (isStep2Valid) {
          setCurrentStep(3);
        }
      }
    } else if (currentStep === 2 && targetStep === 3) {
      const isValid = await trigger(STEP_2_FIELDS);
      if (isValid) {
        setCurrentStep(3);
      }
    }
  };

  const onSubmit = (data: SignUpFormValues) => {
    const payload = {
      username: data.username,
      email: data.email,
      password: data.password,
      companyName: data.companyName,
      companyType: data.companyType,
      otherCompanyType:
        data.companyType === "Others" ? data.otherCompanyType : undefined,
      address: data.address,
      province: data.province,
      city: data.city,
      postalCode: data.postalCode,
      phoneNumber: data.phoneNumber,
      website: data.website || undefined,
      banks: data.banks.map((b) => ({
        beneficiaryName: b.beneficiaryName,
        bankName: b.bankName,
        accountNumber: b.accountNumber,
        branch: b.branch,
        swiftCode: b.swiftCode || undefined,
        isPrimary: b.isPrimary,
      })),
    };

    registerUser(payload, {
      onSuccess: () => {
        toast(<ToastSuccess message={t("auth.registrationSuccess")} />);
        navigate({
          to: "/login",
          search: {
            redirect: "/company",
          },
        });
      },
      onError: (error) => {
        const message = getErrorMessage(error as AxiosError);
        toast(
          <ToastError message={message || t("auth.registrationFailed")} />,
        );
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA") {
        return;
      }
      e.preventDefault();
      if (currentStep < 3) {
        handleNextStep();
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };

  const STEPS = [
    { id: 1, label: t("auth.stepAccount"), icon: User },
    { id: 2, label: t("auth.stepCompany"), icon: Building2 },
    { id: 3, label: t("auth.stepBank"), icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-slate-200 overflow-hidden">
        <div className="h-2 bg-main w-full" />

        <div className="p-6 sm:p-8 md:p-10">
          <div className="flex justify-end mb-2">
            <LanguageSwitcher variant="ghost" size="sm" />
          </div>

          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="size-14 rounded-2xl bg-main/10 flex items-center justify-center">
              <Building2 className="size-7 text-main" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-800">
                {t("auth.signUpTitle")}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {t("auth.loginSubtitle")}
              </p>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mb-8 px-2 sm:px-4">
            <div className="relative flex items-center justify-between">
              {/* Connecting line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 z-0 rounded-full" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-main transition-all duration-300 rounded-full z-0"
                style={{
                  width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
                }}
              />

              {STEPS.map((step) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleStepClick(step.id)}
                    className="relative z-10 flex flex-col items-center group focus:outline-none"
                  >
                    <div
                      className={`size-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 shadow-sm ${
                        isCompleted
                          ? "bg-main text-white ring-4 ring-main/10"
                          : isActive
                            ? "bg-main text-white ring-4 ring-main/20 scale-110"
                            : "bg-white text-slate-400 border-2 border-slate-200 group-hover:border-slate-300"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="size-5 stroke-[2.5]" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold mt-2 transition-colors ${
                        isActive
                          ? "text-main"
                          : isCompleted
                            ? "text-slate-700"
                            : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Step Counter Badge */}
            <div className="flex justify-center mt-4">
              <span className="text-[11px] font-semibold text-main bg-main/10 px-3 py-1 rounded-full">
                {t("common.stepOf", { current: currentStep, total: 3 })}
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={handleKeyDown}
            noValidate
          >
            <FieldGroup className="gap-6">
              {/* ── STEP 1: Account Info ── */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <SectionTitle>{t("auth.accountInfo")}</SectionTitle>

                  {/* Username */}
                  <Field>
                    <FieldLabel htmlFor="username">
                      {t("username")} <Required />
                    </FieldLabel>
                    <Input
                      id="username"
                      placeholder="e.g. john_doe"
                      {...register("username")}
                      onKeyDown={(e) => {
                        if (e.key === " ") {
                          e.preventDefault();
                        }
                      }}
                    />
                    <FieldError>{errors.username?.message}</FieldError>
                  </Field>

                  {/* Email */}
                  <Field>
                    <FieldLabel htmlFor="email">
                      {t("auth.email")} <Required />
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. john@example.com"
                      {...register("email")}
                    />
                    <FieldError>{errors.email?.message}</FieldError>
                  </Field>

                  {/* Password row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Password */}
                    <Field>
                      <FieldLabel htmlFor="password">
                        {t("password")} <Required />
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t("auth.min8Chars")}
                          {...register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-main transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      <FieldError>{errors.password?.message}</FieldError>
                    </Field>

                    {/* Confirm Password */}
                    <Field>
                      <FieldLabel htmlFor="confirmPassword">
                        {t("auth.confirmPassword")} <Required />
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          placeholder={t("auth.repeatPassword")}
                          {...register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-main transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirm ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      <FieldError>{errors.confirmPassword?.message}</FieldError>
                    </Field>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Company Info ── */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <SectionTitle>{t("auth.companyInfo")}</SectionTitle>

                  {/* Company Name + Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="companyName">
                        {t("company.name")} <Required />
                      </FieldLabel>
                      <Input
                        id="companyName"
                        placeholder="e.g. Example Progress"
                        {...register("companyName")}
                      />
                      <p className="text-[10px] text-slate-400 mt-1 italic">
                        {t("auth.noTypeInName")}
                      </p>
                      <FieldError>{errors.companyName?.message}</FieldError>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="companyType">
                        {t("company.companyType")} <Required />
                      </FieldLabel>
                      <Select
                        onValueChange={(val) =>
                          setValue(
                            "companyType",
                            val as SignUpFormValues["companyType"],
                            {
                              shouldValidate: true,
                            },
                          )
                        }
                        value={watch("companyType")}
                      >
                        <SelectTrigger id="companyType" className="w-full">
                          <SelectValue placeholder={t("auth.selectType")} />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANY_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError>{errors.companyType?.message}</FieldError>
                    </Field>

                    {/* Conditional Other Company Type */}
                    {watch("companyType") === "Others" && (
                      <Field className="sm:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <FieldLabel htmlFor="otherCompanyType">
                          {t("auth.specifyCompanyType")} <Required />
                        </FieldLabel>
                        <Input
                          id="otherCompanyType"
                          placeholder={t("auth.otherTypePlaceholder")}
                          {...register("otherCompanyType")}
                        />
                        <FieldError>
                          {errors.otherCompanyType?.message}
                        </FieldError>
                      </Field>
                    )}
                  </div>

                  {/* Address */}
                  <Field>
                    <FieldLabel htmlFor="address">
                      {t("company.address")} <Required />
                    </FieldLabel>
                    <Input
                      id="address"
                      placeholder="Street Address, Building, etc."
                      {...register("address")}
                    />
                    <FieldError>{errors.address?.message}</FieldError>
                  </Field>

                  {/* Province + City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="province">
                        {t("company.province")} <Required />
                      </FieldLabel>
                      <Input
                        id="province"
                        placeholder="Province name"
                        {...register("province")}
                      />
                      <FieldError>{errors.province?.message}</FieldError>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="city">
                        {t("company.city")} <Required />
                      </FieldLabel>
                      <Input
                        id="city"
                        placeholder="City name"
                        {...register("city")}
                      />
                      <FieldError>{errors.city?.message}</FieldError>
                    </Field>
                  </div>

                  {/* Postal + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="postalCode">
                        {t("company.postalCode")} <Required />
                      </FieldLabel>
                      <Input
                        id="postalCode"
                        placeholder="12345"
                        maxLength={5}
                        {...register("postalCode")}
                      />
                      <FieldError>{errors.postalCode?.message}</FieldError>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="phoneNumber">
                        {t("auth.phone")} <Required />
                      </FieldLabel>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+62xxxxxxxxxx"
                        {...register("phoneNumber")}
                      />
                      <FieldError>{errors.phoneNumber?.message}</FieldError>
                    </Field>
                  </div>

                  {/* Website (optional) */}
                  <Field>
                    <FieldLabel htmlFor="website">
                      {t("company.website")}{" "}
                      <span className="text-slate-400 font-normal text-xs">
                        {t("common.optional")}
                      </span>
                    </FieldLabel>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://company.com"
                      {...register("website")}
                    />
                    <FieldError>{errors.website?.message}</FieldError>
                  </Field>
                </div>
              )}

              {/* ── STEP 3: Bank Details ── */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <SectionTitle>{t("auth.bankDetails")}</SectionTitle>
                  <BankArrayFormFields
                    control={control}
                    register={register}
                    errors={errors}
                    setValue={setValue}
                  />
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="h-11 px-5 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold gap-2 transition-all active:scale-[0.98]"
                  >
                    <ArrowLeft className="size-4" />
                    {t("common.previous")}
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="h-11 px-6 bg-main hover:bg-main/90 text-white font-semibold rounded-xl shadow-lg shadow-main/20 gap-2 transition-all active:scale-[0.98] ml-auto"
                  >
                    {t("common.next")}
                    <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-11 px-6 bg-main hover:bg-main/90 text-white font-semibold rounded-xl shadow-lg shadow-main/20 transition-all active:scale-[0.98] ml-auto"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        {t("auth.registering")}
                      </>
                    ) : (
                      <>
                        {t("auth.registerNow")}
                        <Check className="size-4 ml-1 stroke-[2.5]" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Link to Login */}
              <p className="text-center text-sm text-slate-500 pt-2">
                {t("auth.alreadyHaveAccount")}{" "}
                <Link
                  to="/login"
                  search={{
                    redirect: "/company",
                  }}
                  className="text-main font-semibold hover:underline transition-colors"
                >
                  {t("auth.signInHere")}
                </Link>
              </p>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Helper components ── */

function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="h-px flex-1 bg-slate-100" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
        {children}
      </span>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

function Required() {
  return <span className="text-destructive ml-0.5">*</span>;
}
