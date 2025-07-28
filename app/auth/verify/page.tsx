import VerifyPageContent from "@/components/Auth/Verify/VerifyPageContent";
import React, { Suspense } from "react";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
