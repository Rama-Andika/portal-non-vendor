import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";
const ButtonIconPrint = ({
  className,
  ...props
}: React.ComponentProps<typeof Button>) => {
  return (
    <Button size="icon-sm" className="" {...props}>
      <PrinterIcon />
    </Button>
  );
};

export default ButtonIconPrint;
