import * as React from "react";
import { FilterIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReactDatePicker } from "@/components/ui/react-date-picker";
import dayjs from "dayjs";
import ButtonSearch from "@/components/button/ButtonSearch";
import ButtonReset from "@/components/button/ButtonReset";
import { Label } from "@/components/ui/label";
import { PORTAL_REQUEST_STATUS_OPTIONS, type PortalRequestStatus } from "@/types/portal-request.type";
import { useTranslation } from "react-i18next";

export const portalRequestStatusOptions = PORTAL_REQUEST_STATUS_OPTIONS;

interface AdminInvoiceFiltersProps {
  onSearch: (filters: {
    journalNumber: string;
    startDate: string;
    endDate: string;
    status: PortalRequestStatus | undefined;
    companyName: string;
  }) => void;
  onReset: () => void;
  defaultValues: {
    journalNumber: string;
    startDate: string;
    endDate: string;
    status: PortalRequestStatus | undefined;
    companyName: string;
  };
}

export function AdminInvoiceFilters({
  onSearch,
  onReset,
  defaultValues,
}: AdminInvoiceFiltersProps) {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = React.useState(defaultValues);

  React.useEffect(() => {
    setLocalFilters(defaultValues);
  }, [defaultValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localFilters);
  };

  return (
    <Card className="border-none shadow-sm bg-muted/30 rounded-2xl">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4 text-slate-500">
          <FilterIcon className="size-4" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            {t("filters.title")}
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label>{t("company.name")}</Label>
            <Input
              placeholder={t("filters.searchCompany")}
              value={localFilters.companyName}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  companyName: e.target.value,
                }))
              }
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("columns.number")}</Label>
            <Input
              placeholder={t("filters.searchNumber")}
              value={localFilters.journalNumber}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  journalNumber: e.target.value,
                }))
              }
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("filters.startDate")}</Label>
            <ReactDatePicker
              selected={
                localFilters.startDate
                  ? dayjs(localFilters.startDate).toDate()
                  : null
              }
              onChange={(date: Date | null) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  startDate: date ? dayjs(date).format("YYYY-MM-DD") : "",
                }))
              }
              placeholderText={t("filters.selectStartDate")}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("filters.endDate")}</Label>
            <ReactDatePicker
              selected={
                localFilters.endDate
                  ? dayjs(localFilters.endDate).toDate()
                  : null
              }
              onChange={(date: Date | null) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  endDate: date ? dayjs(date).format("YYYY-MM-DD") : "",
                }))
              }
              placeholderText={t("filters.selectEndDate")}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("columns.status")}</Label>
            <Select
              value={localFilters.status || "ALL"}
              onValueChange={(val) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  status: val === "ALL" ? undefined : (val as PortalRequestStatus),
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("filters.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("filters.allStatuses")}</SelectItem>
                {portalRequestStatusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2 lg:col-span-2 xl:col-span-3">
            <ButtonSearch className="px-8 shadow-md shadow-main/20" />
            <ButtonReset
              onClick={onReset}
              variant="ghost"
              className="hover:bg-slate-200"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
