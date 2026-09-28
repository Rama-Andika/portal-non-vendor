import { Button } from "@/components/ui/button";
import { CircleXIcon } from "lucide-react";

const ButtonIconX = ({
  className,
  ...props
}: React.ComponentProps<typeof Button>) => {
  return (
    <Button variant="link" size="icon-sm" className="" {...props} >
      <CircleXIcon />
    </Button>
  );
};

export default ButtonIconX;
