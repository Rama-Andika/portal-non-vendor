import { Heading } from "./heading";
import { SubHeading } from "./sub-heading";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  className?: string; // Desktop-specific class for padding/layout
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <>
      {/* Desktop Header */}
      <div className={`hidden md:flex flex-col gap-1 border-b pb-6 mb-6 ${className}`}>
        <div className="text-main">
          <Heading>{title}</Heading>
        </div>
        <SubHeading>{subtitle}</SubHeading>
      </div>

      {/* Mobile Header (High Contrast Card with accent border) */}
      <div className="md:hidden mt-2 mb-6 p-6 rounded-2xl bg-white border-l-4 border-main shadow-sm animate-in fade-in slide-in-from-left-4 duration-500 overflow-hidden">
        <div className="text-main mb-1">
          <Heading>{title}</Heading>
        </div>
        <SubHeading>{subtitle}</SubHeading>
      </div>
    </>
  );
}
