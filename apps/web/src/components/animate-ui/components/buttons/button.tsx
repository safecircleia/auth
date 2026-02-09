"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Button as ShadcnButton } from "@/components/ui/button";

type ButtonProps = React.ComponentPropsWithoutRef<typeof ShadcnButton> & {
  hoverScale?: number;
  tapScale?: number;
};

function Button({
  hoverScale = 1.05,
  tapScale = 0.95,
  children,
  ...props
}: ButtonProps) {
  return (
    <ShadcnButton asChild {...props}>
      <motion.button
        whileTap={{ scale: tapScale }}
        whileHover={{ scale: hoverScale }}
      >
        {children}
      </motion.button>
    </ShadcnButton>
  );
}

export { Button, type ButtonProps };
