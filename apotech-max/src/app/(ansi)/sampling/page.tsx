"use client";

import { SamplingPlanTab } from "@/components/ansi/SamplingPlanTab";
import { useAnsi } from "@/providers/AnsiProvider";
import { useRouter } from "next/navigation";

export default function SamplingPage() {
  const { setSamplingResult } = useAnsi();
  const router = useRouter();

  return (
    <SamplingPlanTab 
      onSamplingPlanCalculated={(res) => {
        setSamplingResult(res);
        router.push("/defects");
      }} 
    />
  );
}
