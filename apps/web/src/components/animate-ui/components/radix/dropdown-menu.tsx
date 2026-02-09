"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent as ShadcnDropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";

// Re-export all base components
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
};

// Animated content component
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof ShadcnDropdownMenuContent>,
  React.ComponentPropsWithoutRef<typeof ShadcnDropdownMenuContent>
>(({ ...props }, ref) => (
  <DropdownMenuPortal>
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <ShadcnDropdownMenuContent ref={ref} {...props} />
    </motion.div>
  </DropdownMenuPortal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export { DropdownMenuContent };
