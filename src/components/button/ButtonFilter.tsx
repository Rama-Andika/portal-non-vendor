import { Button } from "../ui/button";
import type React from "react";
import classNames from "classnames";
import { FunnelIcon } from "lucide-react";

const ButtonFilter = ({
  className,
  ...props
}: React.ComponentProps<typeof Button>) => {
  return (
    <Button
      type="button"
      variant="outline"
      className={classNames(" w-full", className)}
      {...props}
    >
      <FunnelIcon /> Filter
    </Button>
  );
};

export default ButtonFilter;
