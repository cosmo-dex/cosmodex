"use client";

import { useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/landing/Footer";
import RisingStars from "@/components/RisingStar";
import {
  Send,
  Mail,
  User,
  MessageSquare,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

const CATEGORIES = [
  { id: "general", label: "General Inquiry" },
  { id: "account", label: "Account & Login" },
  { id: "battle", label: "1v1 Battles & Arena" },
  { id: "courses", label: "Courses & Quests" },
  { id: "bug", label: "Bug / Anomaly Report" },
  { id: "partnership", label: "Partnership / Events" },
] as const;

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [transmissionId, setTransmissionId] = useState("");

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("connect.cosmodex@gmail.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // Fallback if clipboard API is not permitted
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    setTimeout(() => {
      const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
      setTransmissionId(`CDX-${randomHex}`);
      setStatus("success");
    }, 1200);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      category: "general",
      subject: "",
      message: "",
    });
    setStatus("idle");
    setTransmissionId("");
  };

  return (
    <div className="relative min-h-screen bg-[#090214] text-white flex flex-col overflow-x-hidden selection:bg-[#E873C3]/30 selection:text-white">
      {/* Background Ambience & Cosmic Starfield */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <RisingStars size={768} speed={1.8} />
        {/* Glowing Cosmic Radials */}
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #E873C3 0%, #8D37D6 50%, transparent 75%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full blur-[160px] opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #C453D6 0%, #8D37D6 50%, transparent 75%)",
          }}
        />
      </div>

      {/* Navigation */}
      <div className="relative z-30">
        <Navbar />
      </div>

      {/* Main Support Content */}
      <main className="relative z-10 flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              lineHeight: 1.15,
            }}
          >
            Transmit Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E873C3] via-[#C453D6] to-[#8D37D6]">
              Signal
            </span>
          </h1>

          <p
            className="mt-4 text-sm sm:text-base leading-relaxed text-white/60 mx-auto"
            style={{ fontFamily: "var(--font-body), 'Fira Code', monospace" }}
          >
            Need help with your account, found an anomaly in battle, or have questions about courses? Send a transmission to the CosmoDex flight crew.
          </p>
        </div>

        {/* Contact Form Container */}
        <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Subtle Card Header Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -left-12 size-48 rounded-full bg-[#E873C3]/15 blur-3xl"
          />

          {status === "success" ? (
            /* Success Confirmation State */
            <div className="py-10 sm:py-12 flex flex-col items-center text-center">
              <div className="size-16 sm:size-20 rounded-full bg-[#3DCB7F]/15 border border-[#3DCB7F]/30 flex items-center justify-center text-[#3DCB7F] mb-6 shadow-[0_0_30px_rgba(61,203,127,0.3)]">
                <CheckCircle2 className="size-8 sm:size-10" />
              </div>

              <span className="text-xs font-mono tracking-widest text-[#3DCB7F] uppercase mb-2">
                Transmission Received
              </span>

              <h3
                className="text-2xl sm:text-3xl font-bold text-white mb-3"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                Signal Logged Successfully
              </h3>

              <div className="px-3.5 py-1.5 rounded-md bg-white/[0.05] border border-white/10 font-mono text-xs text-white/70 mb-4">
                Reference ID: <span className="text-[#E873C3] font-semibold">{transmissionId}</span>
              </div>

              <p
                className="text-sm text-white/60 max-w-md leading-relaxed mb-8"
                style={{ fontFamily: "var(--font-body), 'Fira Code', monospace" }}
              >
                Thank you for reaching out, <span className="text-white font-medium">{formData.name || "Cadet"}</span>. Our mission control team has logged your transmission and will dispatch a response to <span className="text-[#E873C3] font-mono">{formData.email}</span> within 24–48 hours.
              </p>

              <button
                type="button"
                onClick={handleReset}
                className="cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                style={{ fontFamily: "var(--font-body), 'Fira Code', monospace" }}
              >
                <Send className="size-4 text-[#E873C3]" />
                <span>Transmit Another Message</span>
              </button>
            </div>
          ) : (
            /* Interactive Contact Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2.5">
                  1. Transmission Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = formData.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, category: cat.id }))
                        }
                        className={`cursor-pointer px-3 py-2 rounded-lg text-xs font-mono text-left transition-all duration-200 border ${
                          isSelected
                            ? "bg-gradient-to-r from-[#E873C3]/25 to-[#8D37D6]/25 text-[#E873C3] border-[#E873C3]/50 shadow-[0_0_12px_rgba(232,115,195,0.3)]"
                            : "bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Email Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="support-name"
                    className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2"
                  >
                    2. Name / Cadet Handle <span className="text-[#E873C3]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                      <User className="size-4" />
                    </div>
                    <input
                      id="support-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g. Ada Lovelace"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm font-mono outline-none !outline-none focus:outline-none focus-visible:!outline-none focus:border-[#E873C3] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="support-email"
                    className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2"
                  >
                    3. Return Frequency (Email) <span className="text-[#E873C3]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                      <Mail className="size-4" />
                    </div>
                    <input
                      id="support-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="cadet@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm font-mono outline-none !outline-none focus:outline-none focus-visible:!outline-none focus:border-[#E873C3] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Subject Field */}
              <div>
                <label
                  htmlFor="support-subject"
                  className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2"
                >
                  4. Subject <span className="text-[#E873C3]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <MessageSquare className="size-4" />
                  </div>
                  <input
                    id="support-subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    placeholder="Brief summary of your inquiry"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm font-mono outline-none !outline-none focus:outline-none focus-visible:!outline-none focus:border-[#E873C3] transition-colors"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="support-message"
                    className="block text-xs font-mono uppercase tracking-wider text-white/70"
                  >
                    5. Transmission Log (Message) <span className="text-[#E873C3]">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-white/40">
                    {formData.message.length} characters
                  </span>
                </div>
                <textarea
                  id="support-message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Please provide as much context as possible (e.g. error messages, device/browser, course module, or match details)..."
                  className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm font-mono outline-none !outline-none focus:outline-none focus-visible:!outline-none focus:border-[#E873C3] transition-colors resize-y min-h-[120px]"
                />
              </div>

              {/* Submit Button with CosmoDex signature gradient */}
              <div>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="cursor-pointer group relative w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#E873C3] via-[#C453D6] to-[#8D37D6] hover:opacity-90 shadow-[0_0_25px_rgba(232,115,195,0.4)] hover:shadow-[0_0_35px_rgba(232,115,195,0.6)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    fontFamily: "var(--font-body), 'Fira Code', monospace",
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    {status === "submitting" ? (
                      <>
                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Transmitting to Mission Control...</span>
                      </>
                    ) : (
                      <>
                        <span>Transmit Signal</span>
                        <Send className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Direct Dispatch Email Card (Placed at the bottom) */}
        <div className="mt-8 rounded-2xl bg-white/[0.03] border border-white/10 p-6 sm:p-7 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-xl bg-[#E873C3]/15 border border-[#E873C3]/30 flex items-center justify-center text-[#E873C3] shrink-0">
                <Mail className="size-5" />
              </div>
              <div>
                <h3
                  className="text-base font-bold text-white"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  Direct Dispatch Email
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  Prefer direct communication? Reach our team directly at
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center">
              <div className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white/80 select-all">
                connect.cosmodex@gmail.com
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/80 hover:text-white transition-all text-xs font-mono"
                title="Copy email to clipboard"
              >
                {copiedEmail ? (
                  <>
                    <Check className="size-3.5 text-[#3DCB7F]" />
                    <span className="text-[#3DCB7F]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <a
                href="mailto:connect.cosmodex@gmail.com?subject=CosmoDex%20Cadet%20Inquiry"
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#E873C3]/20 to-[#8D37D6]/20 hover:from-[#E873C3]/30 hover:to-[#8D37D6]/30 border border-[#E873C3]/40 text-[#E873C3] hover:text-white transition-all text-xs font-mono"
                title="Open in default mail application"
              >
                <span>Mail</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
