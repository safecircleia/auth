"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay as ShadcnAlertDialogOverlay,
  AlertDialogContent as ShadcnAlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

// Re-export base components
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

// Animated overlay
const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof ShadcnAlertDialogOverlay>,
  React.ComponentPropsWithoutRef<typeof ShadcnAlertDialogOverlay>
>(({ className, ...props }, ref) => {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <ShadcnAlertDialogOverlay ref={ref} className={className} {...props} />
    </motion.div>
  );
});
AlertDialogOverlay.displayName = "AlertDialogOverlay";

// Animated content
interface AlertDialogContentProps extends React.ComponentPropsWithoutRef<
  typeof ShadcnAlertDialogContent
> {
  from?: "top" | "bottom" | "left" | "right";
}

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof ShadcnAlertDialogContent>,
  AlertDialogContentProps
>(({ className, from = "top", ...props }, ref) => {
  const initialRotation =
    from === "bottom" || from === "left" ? "20deg" : "-20deg";
  const isVertical = from === "top" || from === "bottom";
  const rotateAxis = isVertical ? "rotateX" : "rotateY";

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <motion.div
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
        <ShadcnAlertDialogContent ref={ref} className={className} {...props} />
      </motion.div>
    </AlertDialogPortal>
  );
});
AlertDialogContent.displayName = "AlertDialogContent";

export { AlertDialogContent, AlertDialogOverlay, type AlertDialogContentProps };
