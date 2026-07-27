"use client";
import { Suspense } from "react";
import { ComparativoView } from "../(app)/avaliacoes/[id]/comparativo/comparativo-view";
import { sampleComparison } from "@/domain/comparisons/sample-data";
export default function PreviewComparativoPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <Suspense fallback={null}><ComparativoView comparison={sampleComparison} /></Suspense>
      </div>
    </div>
  );
}
