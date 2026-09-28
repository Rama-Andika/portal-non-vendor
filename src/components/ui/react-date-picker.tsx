import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import DatePicker, { type DatePickerProps } from "react-datepicker";
import { useTranslation } from "react-i18next";

type Props = DatePickerProps & {
  className?: string;
};
export function ReactDatePicker({ className, ...props }: Props) {
  const { t } = useTranslation();
  return (
    <DatePicker
      showIcon
      peekNextMonth
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      icon={<Calendar />}
      className={cn(
        "ps-8! placeholder:ps-2 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-10 w-full min-w-0 rounded-xl border border-gray-200 bg-white text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive focus:border-main focus:ring-1 focus:ring-main",
        className,
      )}
      {...props}
    >
      <div className="flex justify-center p-2 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
        <button
          type="button"
          onClick={() => {
            if (props.onChange) {
              (
                props.onChange as (
                  date: Date | null,
                  event?: React.SyntheticEvent,
                ) => void
              )(new Date(), undefined);
            }
          }}
          className="text-xs font-bold text-main hover:text-main/80 transition-colors cursor-pointer"
        >
          {t("common.now") || "Now"}
        </button>
      </div>
    </DatePicker>
  );
}
