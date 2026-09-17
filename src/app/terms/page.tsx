"use client";
/* eslint-disable react/no-unescaped-entities */

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/landing/Footer";
import RisingStars from "@/components/RisingStar";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>
        <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-headings:text-white/90 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4">
          <p className="text-sm text-white/50 mb-8 font-mono">Last Updated: September 17, 2026</p>
          
          <h2 className="text-2xl text-white">1. Acceptance of Terms</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Welcome to CosmoDeX. These Terms of Service ("Terms") govern your access to and use of the CosmoDeX website, applications, courses, coding challenges, and related services (collectively, the "Platform").<br/><br/>
            By accessing or using CosmoDeX, you agree to these Terms. If you do not agree, you must discontinue using the Platform.
          </p>

          <h2 className="text-2xl text-white">2. Description of Service</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            CosmoDeX is a gamified coding and learning platform designed to help students and developers improve their programming skills through interactive courses, coding practice, quizzes, competitive Space Battles, XP progression, leaderboards, and AI-powered code analysis.<br/><br/>
            We may introduce, modify, suspend, or discontinue features as the Platform evolves. Certain features may be in beta, under development, or subject to additional requirements.
          </p>

          <h2 className="text-2xl text-white">3. Eligibility and User Accounts</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            You must provide accurate information when creating an account and keep your account details up to date.<br/><br/>
            You are responsible for:
            <ul className="list-disc pl-6 mt-2">
              <li>Maintaining the confidentiality of your login credentials.</li>
              <li>All activities conducted through your account, to the extent permitted by applicable law.</li>
              <li>Notifying us promptly if you suspect unauthorized access to your account.</li>
            </ul><br/>
            You must not share, sell, transfer, or misuse your account in a way that violates these Terms.
          </p>

          <h2 className="text-2xl text-white">4. User Conduct</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            You agree to use CosmoDeX responsibly and lawfully.<br/><br/>
            You must not:
            <ul className="list-disc pl-6 mt-2">
              <li>Harass, threaten, abuse, or impersonate other users.</li>
              <li>Cheat, exploit bugs, manipulate scores, or artificially inflate XP, rankings, or leaderboard positions.</li>
              <li>Interfere with the operation, security, or availability of the Platform.</li>
              <li>Attempt unauthorized access to accounts, systems, databases, or restricted areas.</li>
              <li>Upload malicious code or use coding labs and challenges to attack systems without authorization.</li>
              <li>Copy, scrape, redistribute, or commercially exploit Platform content without permission.</li>
              <li>Violate applicable laws or the rights of others.</li>
            </ul><br/>
            Violations may result in warnings, removal of content, suspension, or termination of access, depending on the nature and severity of the violation.
          </p>

          <h2 className="text-2xl text-white">5. Coding Challenges and Battle Arena</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            CosmoDeX provides coding exercises, quizzes, and competitive challenges for educational and entertainment purposes.<br/><br/>
            You agree to compete fairly and not manipulate matches, exploit vulnerabilities, interfere with other participants, or use unauthorized methods to gain an unfair advantage.<br/><br/>
            Challenge results, XP, ranks, streaks, and leaderboard positions may be adjusted to correct errors, prevent abuse, or improve the Platform.<br/><br/>
            We do not guarantee uninterrupted matches, specific rankings, or the availability of any particular challenge.
          </p>

          <h2 className="text-2xl text-white">6. Educational Content and AI Features</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            CosmoDeX provides educational materials, automated assessments, and AI-powered code analysis to support learning.<br/><br/>
            AI-generated explanations, code reviews, recommendations, and automated test results may be inaccurate, incomplete, or inconsistent.<br/><br/>
            You are responsible for reviewing and understanding any output before relying on it. CosmoDeX does not guarantee that code or recommendations will be correct, secure, or suitable for a particular purpose.<br/><br/>
            The Platform is an educational resource and does not guarantee academic results, employment, certifications, or professional outcomes.
          </p>

          <h2 className="text-2xl text-white">7. Intellectual Property</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            The CosmoDeX Platform, including its branding, design, interface, original course materials, graphics, and software, is owned by or licensed to CosmoDeX and is protected by applicable intellectual property laws.<br/><br/>
            You may use Platform content for personal, non-commercial learning, subject to these Terms and any applicable content-specific license.<br/><br/>
            You must not reproduce, distribute, modify, sell, or publicly display protected Platform content without prior authorization, except where permitted by law.<br/><br/>
            You retain ownership of content and code that you independently create, subject to any third-party rights and the permissions necessary to operate the Platform.
          </p>

          <h2 className="text-2xl text-white">8. User-Submitted Content</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            If you submit code, feedback, usernames, or other content to CosmoDeX, you are responsible for ensuring that you have the right to submit it.<br/><br/>
            You grant CosmoDeX permission to host, process, display, and use that content as reasonably necessary to provide, maintain, and improve the services you use, subject to our Privacy Policy.<br/><br/>
            You must not submit confidential information, personal data belonging to others, or content that violates applicable law or third-party rights.
          </p>

          <h2 className="text-2xl text-white">9. Plans, Payments, and Early Access</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            CosmoDeX may offer free and paid plans, subscriptions, or additional features.<br/><br/>
            During the public beta or promotional periods, certain features may be available free of charge or under temporary pricing arrangements.<br/><br/>
            Any applicable prices, billing terms, renewal conditions, and cancellation or refund policies will be communicated before a paid transaction.<br/><br/>
            We may change plan features or pricing prospectively, subject to applicable law and any commitments already made to you.
          </p>

          <h2 className="text-2xl text-white">10. Privacy and Cookies</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Your use of CosmoDeX is also governed by our Cookie Policy.<br/><br/>
            These policies explain how information may be collected, used, stored, and processed when you interact with the Platform.<br/><br/>
            By using CosmoDeX, you acknowledge that you have had the opportunity to review these policies.
          </p>

          <h2 className="text-2xl text-white">11. Third-Party Services</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            CosmoDeX may integrate with or link to third-party services, tools, APIs, or websites.<br/><br/>
            Such services may be governed by their own terms and privacy policies. We are not responsible for third-party services that we do not control.<br/><br/>
            You are responsible for reviewing the applicable terms before using those services.
          </p>

          <h2 className="text-2xl text-white">12. Suspension and Termination</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            We may restrict, suspend, or terminate your access if we reasonably believe that you have violated these Terms, compromised Platform security, engaged in fraudulent activity, or created a risk to other users or the service.<br/><br/>
            Where appropriate and reasonably practicable, we may provide notice and an opportunity to address the issue.<br/><br/>
            You may stop using CosmoDeX at any time. Account deletion and the handling of associated information are subject to our Privacy Policy and applicable law.
          </p>

          <h2 className="text-2xl text-white">13. Availability and Disclaimer</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            CosmoDeX is provided on an "as is" and "as available" basis, to the extent permitted by applicable law.<br/><br/>
            We do not guarantee that the Platform will always be available, uninterrupted, error-free, or compatible with every device or environment.<br/><br/>
            We may perform maintenance, updates, or changes that temporarily affect access to the services.<br/><br/>
            Nothing in these Terms excludes any rights or protections that cannot lawfully be excluded.
          </p>

          <h2 className="text-2xl text-white">14. Limitation of Liability</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            To the maximum extent permitted by applicable law, CosmoDeX and its operators, employees, partners, and service providers will not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the Platform.<br/><br/>
            This includes, where legally permitted, loss of data, loss of profits, interruption of service, or reliance on educational or AI-generated content.<br/><br/>
            Nothing in these Terms limits liability where such limitation is prohibited by law.
          </p>

          <h2 className="text-2xl text-white">15. Indemnification</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            To the extent permitted by applicable law, you agree to be responsible for losses, claims, and reasonable expenses arising directly from your unlawful use of the Platform, your violation of these Terms, or your infringement of another person's rights.<br/><br/>
            This provision does not apply to the extent that a claim results from CosmoDeX's own unlawful conduct.
          </p>

          <h2 className="text-2xl text-white">16. Changes to These Terms</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            We may update these Terms from time to time to reflect changes in our services, practices, or legal obligations.<br/><br/>
            The revised version will be published on this page with an updated "Last Updated" date.<br/><br/>
            Where required by law, we will provide notice or obtain consent before changes take effect. Your continued use of the Platform after an update takes effect constitutes acceptance of the revised Terms, to the extent permitted by law.
          </p>

          <h2 className="text-2xl text-white">17. Governing Law</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            These Terms are subject to the laws of India, without prejudice to any mandatory consumer protection rights that may apply to you.<br/><br/>
            Any disputes will be handled by the courts or other forums having jurisdiction under applicable law.
          </p>

          <h2 className="text-2xl text-white">18. Contact Us</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            If you have questions about these Terms, please contact us:<br/><br/>
            <strong>CosmoDeX</strong><br/>
            Website: <a href="https://www.cosmodex.in/" className="text-[#00FFE9] hover:underline" target="_blank" rel="noopener noreferrer">https://www.cosmodex.in/</a><br/>
            Email: <a href="mailto:connect.cosmodex@gmail.com" className="text-[#00FFE9] hover:underline">connect.cosmodex@gmail.com</a>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
