import type { ReactNode } from "react";

const FieldError = ({ children }: { children: ReactNode }) => {
  return <p className="text-xs text-red-500">{children}</p>;
};

export default FieldError;
