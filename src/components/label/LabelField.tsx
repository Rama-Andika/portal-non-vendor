import classNames from "classnames";
import type { ReactNode } from "react";
import { Label } from "../ui/label";
import AppTooltip from "../tootip/app-tooltip";

interface Props extends React.ComponentProps<typeof Label> {
  name: string;
  className?: string;
  tooltip?: boolean;
  tooltipContent?: string;
  children: ReactNode;
}
const LabelField = ({
  name,
  className,
  tooltip,
  tooltipContent,
  children,
  ...props
}: Props) => {
  return (
    <div
      className={classNames(
        "max-sm:col-span-3 max-md:col-span-1 text-gray-500 flex flex-col gap-2",
        className
      )}
    >
      <Label className="font-semibold" {...props}>
        {name} {tooltip && <AppTooltip content={tooltipContent ?? ""} />}
      </Label>
      {children}
    </div>
  );
};

export default LabelField;
