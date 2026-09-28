import { IoIosRefresh } from "react-icons/io";
import { Button } from "../ui/button";
import type React from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

interface Props extends React.ComponentProps<typeof Button> {
  className?: string;
  label?: string;
}

const ButtonReset = ({ className, label, ...props }: Props) => {
  const { t } = useTranslation();
  const displayLabel = label ?? t("common.reset");

  return (
    <Button
      type="button"
      variant="outline"
      className={classNames(
        "w-full md:w-32 h-12 md:h-10",
        "bg-white border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold",
        "transition-all active:scale-95 shadow-sm",
        "flex items-center justify-center gap-2",
        className,
      )}
      {...props}
    >
      <IoIosRefresh size={18} /> {displayLabel}
    </Button>
  );
};

export default ButtonReset;
