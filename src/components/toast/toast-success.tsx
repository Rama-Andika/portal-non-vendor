import { CircleCheckIcon } from 'lucide-react'

export default function ToastSuccess({ message }: { message: string }) {
  return (
    <div className="flex gap-2">
      <CircleCheckIcon className="text-green-400 size-5" />
      <p>{message}</p>
    </div>
  )
}
