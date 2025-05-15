// components/ui/alert.tsx
import React from "react";
import { cn } from "../../(mvc)/lib/utils";

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "destructive";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border p-4",
      variant === "default" && "bg-background text-foreground",
      variant === "destructive" && "border-red-500/50 text-red-600 bg-red-50",
      className
    )}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("mt-2 text-sm leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };
