"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

export function MoneyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [display, setDisplay] = useState(value.toLocaleString("ja-JP"));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDisplay(value.toLocaleString("ja-JP"));
    }
  }, [value, focused]);

  return (
    <Input
      inputMode="numeric"
      value={display}
      onFocus={() => {
        setFocused(true);
        setDisplay(value === 0 ? "" : String(value));
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9]/g, "");
        setDisplay(raw);
        onChange(raw === "" ? 0 : Number(raw));
      }}
      onBlur={() => {
        setFocused(false);
        setDisplay(value.toLocaleString("ja-JP"));
      }}
    />
  );
}
