"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.ComponentPropsWithoutRef<
  typeof ShadcnCheckbox
> {
  variant?: "default" | "accent";
  size?: "default" | "sm" | "lg";
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof ShadcnCheckbox>,
  CheckboxProps
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
      <ShadcnCheckbox
        ref={ref}
        className={cn(
          "peer shrink-0 flex items-center justify-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-500 focus-visible:ring-offset-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
          variant === "default" && "bg-background border",
          variant === "accent" && "bg-input",
          size === "default" && "size-5 rounded-sm",
          size === "sm" && "size-4.5 rounded-[5px]",
          size === "lg" && "size-6 rounded-[7px]",
          className,
        )}
        {...props}
      />
    </motion.div>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox, type CheckboxProps };
