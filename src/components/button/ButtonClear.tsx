import classNames from "classnames";
import { Button } from "../ui/button";
import { MdOutlineClear } from "react-icons/md";

const ButtonClear = ({
  className,
  ...props
}: React.ComponentProps<typeof Button>) => {
  return (
    <Button
      variant="outline"
      className={classNames("w-full", className)}
      {...props}
    >
      <MdOutlineClear /> Clear
    </Button>
  );
};

export default ButtonClear;
