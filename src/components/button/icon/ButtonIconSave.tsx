import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";

const ButtonIconSave = ({
  className,
  ...props
}: React.ComponentProps<typeof Button>) => {
  return (
    <Button variant="link" size="icon-sm" className="" {...props}>
      <SaveIcon />
    </Button>
  );
};

export default ButtonIconSave;
