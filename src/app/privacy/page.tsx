"use client";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/landing/Footer";
import RisingStars from "@/components/RisingStar";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#060813] text-white flex flex-col font-sans relative overflow-hidden">
      <RisingStars />
      <Navbar />

      <div className="flex-grow pt-32 pb-24 relative z-10 max-w-3xl mx-auto w-full px-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors text-sm font-medium w-fit"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
        <h1 className="text-4xl md:text-5xl font-black mb-8 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-headings:text-white/90 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4">
          <p className="text-sm text-white/50 mb-8 font-mono">Last Updated: September 2026</p>
          
          <h2 className="text-2xl text-white">1. Introduction</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Welcome to CosmoDex! We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at connect.cosmodex@gmail.com.
          </p>
          
          <h2 className="text-2xl text-white">2. Information We Collect</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            We collect personal information that you voluntarily provide to us when you register on the platform, express an interest in obtaining information about us or our products and services, when you participate in activities on the platform (such as battles or courses) or otherwise when you contact us.
          </p>
          
          <h2 className="text-2xl text-white">3. How We Use Your Information</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            We use personal information collected via our platform for a variety of business purposes. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
          </p>
          
          <h2 className="text-2xl text-white">4. Information Sharing</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell your personal information to third parties.
          </p>
          
          <h2 className="text-2xl text-white">5. Data Retention</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law.
          </p>
          
          <h2 className="text-2xl text-white">6. Contact Us</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            If you have questions or comments about this notice, you may email us at connect.cosmodex@gmail.com.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
