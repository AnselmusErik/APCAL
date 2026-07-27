"use client";

import { HistoryTab } from "@/components/ansi/HistoryTab";
import { useAnsi } from "@/providers/AnsiProvider";

export default function HistoryPage() {
  const { evaluateHistoryItem } = useAnsi();

  return (
    <HistoryTab onSelectForEvaluation={evaluateHistoryItem} />
  );
}
