import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CharacterCountTextareaProps
  extends React.ComponentProps<typeof Textarea> {
  maxLength?: number;
  currentLength?: number;
}

const CharacterCountTextarea = React.forwardRef<
  HTMLTextAreaElement,
  CharacterCountTextareaProps
>(
  (
    { className, maxLength = 150, currentLength, onChange, value, defaultValue, ...props },
    ref
  ) => {
    // Determine initial length
    const getInitialLength = () => {
      if (value !== undefined && value !== null) return String(value).length;
      if (defaultValue !== undefined && defaultValue !== null) return String(defaultValue).length;
      return 0;
    };

    const [localLength, setLocalLength] = React.useState(getInitialLength);

    // Keep localLength in sync with controlled value if it changes
    React.useEffect(() => {
      if (value !== undefined && value !== null) {
        setLocalLength(String(value).length);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalLength(e.target.value.length);
      if (onChange) {
        onChange(e);
      }
    };

    const displayLength = currentLength !== undefined ? currentLength : localLength;
    const remaining = Math.max(0, maxLength - displayLength);
    const isLimitReached = remaining === 0;

    return (
      <div className="space-y-1.5 w-full">
        <Textarea
          ref={ref}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn("w-full", className)}
          {...props}
        />
        <div
          className={cn(
            "text-right text-xs transition-colors duration-200 select-none",
            isLimitReached
              ? "text-red-500 font-bold"
              : remaining <= 10
              ? "text-amber-500 font-medium"
              : "text-slate-400"
          )}
        >
          {remaining} characters remaining
        </div>
      </div>
    );
  }
);

CharacterCountTextarea.displayName = "CharacterCountTextarea";

export { CharacterCountTextarea };
