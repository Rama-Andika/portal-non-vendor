import { Button } from "@/components/ui/button";
import { LuPencil } from "react-icons/lu";
const ButtonIconPencil = ({
  className,
  ...props
}: React.ComponentProps<typeof Button>) => {
  return (
    <Button variant="link" size="icon-sm" {...props}>
      <LuPencil />
    </Button>
  );
};

export default ButtonIconPencil;
