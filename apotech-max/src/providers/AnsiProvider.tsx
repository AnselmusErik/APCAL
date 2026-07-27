"use client";

import { createContext, useContext, useState } from "react";
import type { SamplingPlanResponse } from "@/types/ansi";
import { useRouter } from "next/navigation";

interface AnsiContextType {
  samplingResult: SamplingPlanResponse | null;
  setSamplingResult: (result: SamplingPlanResponse | null) => void;
  evaluateHistoryItem: (entry: any) => void;
}

const AnsiContext = createContext<AnsiContextType | undefined>(undefined);

export function AnsiProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [samplingResult, setSamplingResult] = useState<SamplingPlanResponse | null>(null);

  function evaluateHistoryItem(entry: any) {
    const samplingPlanRes: SamplingPlanResponse = {
      historyId: entry.id,
      productName: entry.productName ?? "",
      batchNumber: entry.batchNumber ?? "",
      lotSize: entry.lotSize,
      inspectionLevel: entry.inspectionLevel as any,
      inspectionCode: entry.inspectionCode as any,
      inspectionCodeLabel: entry.inspectionCodeLabel,
      letterCode: entry.letterCode,
      inspectionTypeLabel: entry.inspectionTypeLabel,
      initialDefects: entry.defectCounts ?? undefined,
      samplingPlan: {
        code: entry.letterCode,
        sampleSize: entry.sampleSize,
        critical: entry.critical,
        major: entry.major,
        minor: entry.minor,
      },
    };
    setSamplingResult(samplingPlanRes);
    router.push("/defects");
  }

  return (
    <AnsiContext.Provider value={{ samplingResult, setSamplingResult, evaluateHistoryItem }}>
      {children}
    </AnsiContext.Provider>
  );
}

export function useAnsi() {
  const context = useContext(AnsiContext);
  if (context === undefined) {
    throw new Error("useAnsi must be used within an AnsiProvider");
  }
  return context;
}
