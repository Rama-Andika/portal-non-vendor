import { Button } from "@/components/ui/button";
import { FaRegFilePdf } from "react-icons/fa6";
const ButtonIconPdf = ({
  className,
  ...props
}: React.ComponentProps<typeof Button>) => {
  return (
    <Button size="icon-sm" className="bg-red-500 hover:bg-red-400" {...props}>
      <FaRegFilePdf />
    </Button>
  );
};

export default ButtonIconPdf;
