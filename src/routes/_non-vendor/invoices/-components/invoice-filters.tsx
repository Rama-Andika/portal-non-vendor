import * as React from "react";
import { useTranslation } from "react-i18next";
import { FilterIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export const portalRequestStatusOptions = PORTAL_REQUEST_STATUS_OPTIONS;

interface InvoiceFiltersProps {
  onSearch: (filters: {
    number: string;
    startDate: string;
    endDate: string;
    status: PortalRequestStatus | undefined;
  }) => void;
  onReset: () => void;
  defaultValues: {
    number: string;
    startDate: string;
    endDate: string;
    status: PortalRequestStatus | undefined;
  };
}

export function InvoiceFilters({
  onSearch,
  onReset,
  defaultValues,
}: InvoiceFiltersProps) {
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
    <Card className="border-none shadow-sm bg-muted/30">
      <CardHeader className="pb-3 px-4 md:px-6">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FilterIcon className="size-4" />
          {t("filters.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 md:px-6 pb-6">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 items-end gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label>{t("filters.number")}</Label>
            <Input
              placeholder={t("filters.searchNumber")}
              value={localFilters.number}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  number: e.target.value,
                }))
              }
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
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

          <div className="flex flex-col gap-2">
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

          <div className="flex flex-col gap-2">
            <Label>{t("common.status")}</Label>
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

          <div className="flex items-center gap-2">
            <ButtonSearch className="flex-1" />
            <ButtonReset onClick={onReset} className="flex-1" />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
