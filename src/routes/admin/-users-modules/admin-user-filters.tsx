import * as React from "react";
import { FilterIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DOCUMENT_STATUS } from "@/enums/document-status.enum";
import ButtonSearch from "@/components/button/ButtonSearch";
import ButtonReset from "@/components/button/ButtonReset";
import { useTranslation } from "react-i18next";

interface AdminUserFiltersProps {
  onSearch: (filters: { companyName: string; status: string }) => void;
  onReset: () => void;
  defaultValues: { companyName: string; status: string };
}

export function AdminUserFilters({
  onSearch,
  onReset,
  defaultValues,
}: AdminUserFiltersProps) {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = React.useState(defaultValues);

  // Sync with defaultValues if they change externally (e.g. on reset)
  React.useEffect(() => {
    setLocalFilters(defaultValues);
  }, [defaultValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localFilters);
  };

  return (
    <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden mb-6">
      <CardHeader className="py-4 border-b border-gray-100 bg-gray-50/50">
        <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
          <FilterIcon className="size-4 text-main" />
          <span>{t("filters.title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                {t("auth.companyName")}
              </label>
              <Input
                placeholder={t("filters.searchCompany")}
                value={localFilters.companyName}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    companyName: e.target.value,
                  }))
                }
                className="bg-white border-gray-200 focus-visible:ring-main"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">{t("common.status")}</label>
              <Select
                value={localFilters.status}
                onValueChange={(val) =>
                  setLocalFilters((prev) => ({ ...prev, status: val }))
                }
              >
                <SelectTrigger className="bg-white border-gray-200 focus:ring-main">
                  <SelectValue placeholder={t("filters.allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_STATUS">{t("filters.allStatuses")}</SelectItem>
                  {[
                    DOCUMENT_STATUS.PENDING,
                    DOCUMENT_STATUS.REVISION,
                    DOCUMENT_STATUS.APPROVED,
                  ].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1 justify-end">
            <ButtonSearch className="flex-1 lg:flex-none" />
            <ButtonReset
              onClick={onReset}
              className="flex-1 lg:flex-none"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
