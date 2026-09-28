import { CircleXIcon } from "lucide-react";

export default function ToastError({ message }: { message: string }) {
  return (
    <div className="flex gap-2">
      <CircleXIcon className="text-red-500 size-5" />
      <p>{message}</p>
    </div>
  );
}
