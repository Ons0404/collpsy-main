import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../(mvc)/lib/utils";

const switchVariants = cva(
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-destructive",
        outline:
          "border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const thumbVariants = cva(
  "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
  {
    variants: {
      size: {
        default: "",
        sm: "h-4 w-4",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, variant, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(switchVariants({ variant, className }))}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb className={cn(thumbVariants())} />
  </SwitchPrimitives.Root>
));

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
