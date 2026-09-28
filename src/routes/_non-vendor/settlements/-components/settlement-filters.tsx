import * as React from "react";
import { FilterIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ReactDatePicker } from "@/components/ui/react-date-picker";
import dayjs from "dayjs";
import ButtonSearch from "@/components/button/ButtonSearch";
import ButtonReset from "@/components/button/ButtonReset";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface SettlementFiltersProps {
  onSearch: (filters: {
    journalNumber: string;
    startDate: string;
    endDate: string;
  }) => void;
  onReset: () => void;
  defaultValues: {
    journalNumber: string;
    startDate: string;
    endDate: string;
  };
}

export function SettlementFilters({
  onSearch,
  onReset,
  defaultValues,
}: SettlementFiltersProps) {
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-end gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label>
              {t("settlement.journalNumber")}
            </Label>
            <Input
              placeholder={t("filters.searchNumber")}
              value={localFilters.journalNumber}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  journalNumber: e.target.value,
                }))
              }
              className="w-full h-10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              {t("filters.startDate")}
            </Label>
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
              className="w-full h-10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              {t("filters.endDate")}
            </Label>
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
              className="w-full h-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <ButtonSearch className="flex-1 h-10" />
            <ButtonReset onClick={onReset} className="flex-1 h-10" />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
