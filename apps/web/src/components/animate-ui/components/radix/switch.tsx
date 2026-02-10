"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Switch as ShadcnSwitch } from "@/components/ui/switch";

type SwitchProps = React.ComponentPropsWithoutRef<typeof ShadcnSwitch> & {
  tapScale?: number;
  hoverScale?: number;
};

const Switch = React.forwardRef<
  React.ElementRef<typeof ShadcnSwitch>,
  SwitchProps
>(({ tapScale = 0.95, hoverScale = 1.05, ...props }, ref) => (
  <motion.div
    whileTap={{ scale: tapScale }}
    whileHover={{ scale: hoverScale }}
    style={{ display: "inline-flex" }}
  >
    <ShadcnSwitch ref={ref} {...props} />
  </motion.div>
));
Switch.displayName = "Switch";

export { Switch, type SwitchProps };
