import { IoMdInformationCircleOutline } from "react-icons/io";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const AppTooltip = ({ content }: { content: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IoMdInformationCircleOutline />
      </TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default AppTooltip;
