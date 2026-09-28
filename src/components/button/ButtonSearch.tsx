import { IoIosSearch } from "react-icons/io";
import { Button } from "../ui/button";
import type React from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

interface Props extends React.ComponentProps<typeof Button> {
  className?: string;
  label?: string;
}

const ButtonSearch = ({ className, label, ...props }: Props) => {
  const { t } = useTranslation();
  const displayLabel = label ?? t("common.searchBtn");

  return (
    <Button
      type="submit"
      variant="default"
      className={classNames(
        "w-full md:w-32 h-12 md:h-10",
        "bg-main hover:bg-main/90 text-white rounded-xl font-semibold",
        "transition-all active:scale-95 shadow-md shadow-main/20",
        "flex items-center justify-center gap-2",
        className,
      )}
      {...props}
    >
      <IoIosSearch size={18} /> {displayLabel}
    </Button>
  );
};

export default ButtonSearch;
