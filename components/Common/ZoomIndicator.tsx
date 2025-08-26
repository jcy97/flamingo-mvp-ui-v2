"use client";
import React from "react";
import { useAtomValue } from "jotai";
import { viewportAtom, showZoomIndicatorAtom } from "@/stores/viewportStore";

export default function ZoomIndicator() {
  const viewport = useAtomValue(viewportAtom);
  const showIndicator = useAtomValue(showZoomIndicatorAtom);
  const zoomPercentage = Math.round(viewport.zoom * 100);

  if (!showIndicator) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-sm px-3 py-1.5 rounded-md font-mono shadow-lg z-50 pointer-events-none select-none transition-opacity duration-200">
      {zoomPercentage}%
    </div>
  );
}
