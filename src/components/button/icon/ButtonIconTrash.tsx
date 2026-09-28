import { Button } from "@/components/ui/button";
import { FaRegTrashCan } from "react-icons/fa6";

const ButtonIconTrash = ({
  className,
  ...props
}: React.ComponentProps<typeof Button>) => {
  return (
    <Button variant="link" size="icon-sm" {...props}>
      <FaRegTrashCan />
    </Button>
  );
};

export default ButtonIconTrash;
