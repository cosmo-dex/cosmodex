import type { Metadata } from "next";
import OnboardingFlow from "@/features/onboarding/OnboardingFlow";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Onboarding | CosmoDex",
  alternates: {
    canonical: `${appUrl}/onboarding`,
  },
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