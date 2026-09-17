"use client";
/* eslint-disable react/no-unescaped-entities */

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/landing/Footer";
import RisingStars from "@/components/RisingStar";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CookiePolicyPage() {
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
          Cookie Policy
        </h1>
        <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-headings:text-white/90 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4">
          <p className="text-sm text-white/50 mb-8 font-mono">Last Updated: September 17, 2026</p>
          
          <h2 className="text-2xl text-white">1. Introduction</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Welcome to CosmoDeX.<br/><br/>
            This Cookie Policy explains how cookies and similar technologies may be used when you visit or interact with the CosmoDeX website and related services.<br/><br/>
            We use these technologies, where applicable, to support website functionality, remember preferences, understand how our Platform is used, and improve your learning experience.
          </p>

          <h2 className="text-2xl text-white">2. What Are Cookies?</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Cookies are small text files stored on your device when you visit a website. They allow websites to remember information about your visit, such as login status or preferences.<br/><br/>
            Other technologies, including local storage, session storage, pixels, and similar identifiers, may serve comparable purposes.<br/><br/>
            In this policy, we use the term "cookies" to refer to cookies and similar technologies unless otherwise specified.
          </p>

          <h2 className="text-2xl text-white">3. Types of Cookies We May Use</h2>
          
          <h3 className="text-xl text-white mt-6">A. Essential Cookies</h3>
          <p className="text-white/70 leading-relaxed mb-4">
            These cookies are necessary for the website or its core features to function.<br/>
            They may support:
            <ul className="list-disc pl-6 mt-2">
              <li>Account authentication and login sessions.</li>
              <li>Security and fraud prevention.</li>
              <li>Session management.</li>
              <li>Essential website functionality.</li>
            </ul><br/>
            These cookies cannot generally be disabled through our website's cookie preferences if they are necessary for a service you request. You may still be able to block them through your browser, but some features may stop working.
          </p>

          <h3 className="text-xl text-white mt-6">B. Functional Cookies</h3>
          <p className="text-white/70 leading-relaxed mb-4">
            These cookies help remember your preferences and improve your experience.<br/>
            Depending on the features available, they may be used to remember:
            <ul className="list-disc pl-6 mt-2">
              <li>Interface or display preferences.</li>
              <li>Learning-related settings.</li>
              <li>Previously selected options.</li>
            </ul><br/>
            Disabling these cookies may mean that certain preferences are not remembered between visits.
          </p>

          <h3 className="text-xl text-white mt-6">C. Analytics Cookies</h3>
          <p className="text-white/70 leading-relaxed mb-4">
            If enabled, analytics cookies help us understand how visitors interact with CosmoDeX.<br/>
            They may help us understand:
            <ul className="list-disc pl-6 mt-2">
              <li>Which pages and learning features are used.</li>
              <li>How visitors navigate the website.</li>
              <li>Website performance and technical issues.</li>
              <li>General usage patterns that help us improve the Platform.</li>
            </ul><br/>
            Where required, these technologies will only be used after you provide the appropriate consent.
          </p>

          <h3 className="text-xl text-white mt-6">D. Third-Party Cookies</h3>
          <p className="text-white/70 leading-relaxed mb-6">
            Some features may rely on third-party services, such as embedded content, analytics providers, or external integrations.<br/>
            These services may set their own cookies or use similar technologies according to their respective policies.<br/>
            We will identify relevant third-party technologies through our cookie preferences or other appropriate disclosures where applicable.
          </p>

          <h2 className="text-2xl text-white">4. How We Use Cookies</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Depending on the technologies actually implemented on CosmoDeX, cookies may help us:
            <ul className="list-disc pl-6 mt-2">
              <li>Keep the website secure and operational.</li>
              <li>Maintain your login session.</li>
              <li>Remember selected preferences.</li>
              <li>Improve website speed, reliability, and usability.</li>
              <li>Understand general website usage.</li>
              <li>Support optional integrations and features.</li>
            </ul><br/>
            We do not use cookies for purposes beyond those disclosed and permitted by applicable law.
          </p>

          <h2 className="text-2xl text-white">5. Managing Your Cookie Preferences</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Where a cookie preference tool is available, you can use it to review and manage your choices for non-essential cookies.<br/><br/>
            You may also manage cookies through your browser settings. Most browsers allow you to:
            <ul className="list-disc pl-6 mt-2">
              <li>View stored cookies.</li>
              <li>Delete existing cookies.</li>
              <li>Block some or all cookies.</li>
              <li>Configure settings for individual websites.</li>
            </ul><br/>
            Please note that disabling essential cookies may affect login, navigation, or other core Platform features.<br/><br/>
            If you withdraw consent for optional cookies, this will apply to future use of those technologies. Previously stored cookies may need to be deleted separately through your browser settings.
          </p>

          <h2 className="text-2xl text-white">6. Cookie Consent</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Where applicable law requires consent, CosmoDeX will seek your consent before using non-essential cookies or similar technologies.<br/><br/>
            You may change or withdraw your consent through the available preference controls.<br/><br/>
            Withdrawing consent does not affect the lawfulness of processing that occurred before the withdrawal.
          </p>

          <h2 className="text-2xl text-white">7. Data Collected Through Cookies</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Depending on the technology and purpose, cookies may collect or support the processing of information such as:
            <ul className="list-disc pl-6 mt-2">
              <li>Device and browser information.</li>
              <li>Session identifiers.</li>
              <li>Website interaction and navigation data.</li>
              <li>Preference settings.</li>
              <li>Technical performance information.</li>
            </ul><br/>
            The information collected and how it is processed depend on the specific cookies and services in use.<br/><br/>
            For additional details about personal information, data retention, and your rights, please refer to our Privacy Policy.
          </p>

          <h2 className="text-2xl text-white">8. Third-Party Privacy Policies</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Third-party services that use cookies or similar technologies may process information under their own privacy policies.<br/><br/>
            We encourage you to review those policies when interacting with external services.<br/><br/>
            CosmoDeX does not control the cookie practices of independent third-party websites or services.
          </p>

          <h2 className="text-2xl text-white">9. Changes to This Cookie Policy</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            We may update this Cookie Policy as our Platform, technologies, or legal requirements change.<br/><br/>
            Any revised version will be published on this page with an updated "Last Updated" date.<br/><br/>
            We encourage you to review this page periodically to stay informed about our cookie practices.
          </p>

          <h2 className="text-2xl text-white">10. Contact Us</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            If you have questions about this Cookie Policy or how cookies are used on CosmoDeX, please contact us:<br/><br/>
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
