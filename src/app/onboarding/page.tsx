import type { Metadata } from "next";
import OnboardingFlow from "@/features/onboarding/OnboardingFlow";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Onboarding | CosmoDex",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0518] flex items-center justify-center text-white font-mono">Loading...</div>}>
      <OnboardingFlow />
    </Suspense>
  );
}