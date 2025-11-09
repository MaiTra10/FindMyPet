import { ReactNode } from "react";

interface PageHeaderProps {
  subtitle?: string;
  extraContent?: ReactNode;
}

export function PageHeader({ subtitle, extraContent }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {extraContent && (
        <div className="mb-4">
          {extraContent}
        </div>
      )}
      
      {subtitle && (
        <p className="text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}
