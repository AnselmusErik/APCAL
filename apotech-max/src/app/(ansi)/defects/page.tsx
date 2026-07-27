"use client";

import { DefectsTab } from "@/components/ansi/DefectsTab";
import { useAnsi } from "@/providers/AnsiProvider";

export default function DefectsPage() {
  const { samplingResult } = useAnsi();

  return (
    <DefectsTab samplingResult={samplingResult} />
  );
}
