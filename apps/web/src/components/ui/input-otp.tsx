"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InputOTPProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

function InputOTP({
  length = 6,
  value = "",
  onChange,
  onComplete,
  disabled = false,
  className,
  autoFocus = true,
}: InputOTPProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = React.useState<string[]>(
    value.split("").concat(Array(length - value.length).fill(""))
  );

  React.useEffect(() => {
    const newOtp = value
      .split("")
      .concat(Array(length - value.length).fill(""))
      .slice(0, length);
    setOtp(newOtp);
  }, [value, length]);

  React.useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, inputValue: string) => {
    if (disabled) return;

    // Handle paste
    if (inputValue.length > 1) {
      const pastedValue = inputValue.slice(0, length);
      const newOtp = pastedValue
        .split("")
        .concat(Array(length - pastedValue.length).fill(""))
        .slice(0, length);
      setOtp(newOtp);
      const newValue = newOtp.join("");
      onChange?.(newValue);
      if (newValue.length === length && !newValue.includes("")) {
        onComplete?.(newValue);
      }
      // Focus the last filled input or the next empty one
      const nextIndex = Math.min(pastedValue.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Only allow digits
    if (inputValue && !/^\d$/.test(inputValue)) return;

    const newOtp = [...otp];
    newOtp[index] = inputValue;
    setOtp(newOtp);

    const newValue = newOtp.join("");
    onChange?.(newValue);

    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newValue.length === length && !newValue.includes("")) {
      onComplete?.(newValue);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData) {
      handleChange(0, pastedData);
    }
  };

  return (
    <div
      className={cn("flex items-center justify-center gap-2", className)}
      role="group"
      aria-label="One-time password input"
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={otp[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          autoComplete="one-time-code"
          className={cn(
            "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-12 w-10 items-center justify-center rounded-md border text-center text-lg font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "sm:h-14 sm:w-12 sm:text-xl"
          )}
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  );
}

export { InputOTP };
export type { InputOTPProps };
