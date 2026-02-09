"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogClose,
  DialogContent as ShadcnDialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay as ShadcnDialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Re-export base components
export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

// Animated overlay
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof ShadcnDialogOverlay>,
  React.ComponentPropsWithoutRef<typeof ShadcnDialogOverlay>
>(({ className, ...props }, ref) => {
  return (
    <motion.div
      key="dialog-overlay"
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <ShadcnDialogOverlay ref={ref} className={className} {...props} />
    </motion.div>
  );
});
DialogOverlay.displayName = "DialogOverlay";

// Animated content
interface DialogContentProps extends React.ComponentPropsWithoutRef<
  typeof ShadcnDialogContent
> {
  from?: "top" | "bottom" | "left" | "right";
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof ShadcnDialogContent>,
  DialogContentProps
>(({ className, from = "top", ...props }, ref) => {
  const initialRotation =
    from === "bottom" || from === "left" ? "20deg" : "-20deg";
  const isVertical = from === "top" || from === "bottom";
  const rotateAxis = isVertical ? "rotateX" : "rotateY";

  return (
    <DialogPortal>
      <DialogOverlay />
      <motion.div
        key="dialog-content"
        initial={{
          opacity: 0,
          filter: "blur(4px)",
          transform: `perspective(500px) ${rotateAxis}(${initialRotation}) scale(0.8)`,
        }}
        animate={{
          opacity: 1,
          filter: "blur(0px)",
          transform: `perspective(500px) ${rotateAxis}(0deg) scale(1)`,
        }}
        exit={{
          opacity: 0,
          filter: "blur(4px)",
          transform: `perspective(500px) ${rotateAxis}(${initialRotation}) scale(0.8)`,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 25 }}
      >
        <ShadcnDialogContent ref={ref} className={className} {...props} />
      </motion.div>
    </DialogPortal>
  );
});
DialogContent.displayName = "DialogContent";

export { DialogContent, DialogOverlay, type DialogContentProps };
