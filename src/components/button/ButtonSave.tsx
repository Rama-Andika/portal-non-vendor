import classNames from "classnames";
import { Button } from "../ui/button";
import { LuSave, LuLoader } from "react-icons/lu";
import { useIsMobile } from "@/hooks/use-mobile";

interface ButtonSaveProps extends React.ComponentProps<typeof Button> {
  label?: string;
  loading?: boolean;
}

const ButtonSave = ({
  className,
  label = "Save",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonSaveProps) => {
  const isMobile = useIsMobile();

  return (
    <Button
      type="submit"
      variant="default"
      disabled={loading || disabled}
      className={classNames(
        "relative flex flex-col items-center justify-center gap-1",
        "bg-main hover:bg-main/90 text-white transition-all active:scale-95",
        "shadow-lg shadow-main/20 font-bold",
        "w-full md:w-32",
        isMobile
          ? "h-12 rounded-2xl px-6 text-sm"
          : "h-14 rounded-2xl px-10 text-md",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {loading ? (
          <LuLoader className="h-5 w-5 animate-spin" />
        ) : (
          <LuSave className="h-5 w-5" />
        )}
        <span>{children || label}</span>
      </div>
    </Button>
  );
};

export default ButtonSave;
