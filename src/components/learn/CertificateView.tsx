"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  ArrowLeft,
  Lock,
  Sparkles,
  Award,
} from "lucide-react";
import { Starfield } from "@/components/leaderboard/Starfield";
import confetti from "canvas-confetti";

interface CertificateData {
  authenticated: boolean;
  eligible: boolean;
  courseCode: string;
  courseTitle: string;
  username: string;
  totalModules: number;
  completedModules: number;
  completedAt: string;
  xpEarned: number;
  certificateId: string;
  message?: string;
}

function normalizeCourseSlug(slug?: string): string {
  if (!slug) return "python";
  const s = slug.toLowerCase().trim();
  if (s === "python" || s === "py" || s === "py-1" || s.startsWith("py-") || s.startsWith("python")) {
    return "python";
  }
  if (s === "html" || s === "web-1" || s === "html-1" || s.startsWith("html-") || s.startsWith("web-")) {
    return "html";
  }
  return s;
}

export default function CertificateView({ courseSlug }: { courseSlug?: string }) {
  const params = useParams();
  const resolvedSlug = normalizeCourseSlug(courseSlug || (params?.courseId as string));

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CertificateData | null>(null);
  const [studentName, setStudentName] = useState<string>("");
  const [inputName, setInputName] = useState<string>("");
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fireCelebration = useCallback(() => {
    // Boom Celebration multi-stage confetti
    const end = Date.now() + 2.5 * 1000;
    const colors = ["#00FFE9", "#FF007A", "#FFD700", "#9E00F6", "#FFFFFF"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.65 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  useEffect(() => {
    let active = true;
    const storageKey = `cosmodex_cert_name_${resolvedSlug}`;

    fetch(`/api/learning/certificate/${resolvedSlug}`)
      .then((res) => res.json())
      .then((resData: CertificateData) => {
        if (!active) return;
        setData(resData);
        setLoading(false);

        if (resData.eligible) {
          const savedName = localStorage.getItem(storageKey) || localStorage.getItem("cosmodex_cert_name_global");
          if (savedName && savedName.trim().length >= 2) {
            setStudentName(savedName.trim());
            fireCelebration();
          } else {
            // First time completing the course - ask user for their full name
            const defaultName = resData.username && resData.username !== "Explorer" ? resData.username : "";
            setInputName(defaultName);
            setIsNameModalOpen(true);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load certificate data", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [resolvedSlug, fireCelebration]);

  const handleConfirmName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = inputName.trim();
    if (!cleanName || cleanName.length < 2) return;

    setIsSavingName(true);
    const storageKey = `cosmodex_cert_name_${resolvedSlug}`;
    try {
      localStorage.setItem(storageKey, cleanName);
      localStorage.setItem("cosmodex_cert_name_global", cleanName);
      await fetch(`/api/learning/certificate/${resolvedSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: cleanName }),
      });
    } catch (err) {
      console.warn("Failed to persist certificate name remotely", err);
    } finally {
      setStudentName(cleanName);
      setIsSavingName(false);
      setIsNameModalOpen(false);
      fireCelebration();
    }
  };

  const drawCertificateCanvas = useCallback(async () => {
    if (!canvasRef.current || !data || !data.eligible) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 3510;
    const height = 2482;
    canvas.width = width;
    canvas.height = height;

    // Load base template image
    const baseImg = new Image();
    baseImg.src = "/certificates/base_template.png";
    await new Promise((resolve) => {
      baseImg.onload = resolve;
      baseImg.onerror = resolve;
    });

    if (baseImg.complete && baseImg.naturalWidth > 0) {
      ctx.drawImage(baseImg, 0, 0, width, height);
    } else {
      // Fallback background if image fails
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#08051a");
      bgGrad.addColorStop(1, "#030208");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Ensure Arizonia font is explicitly loaded
    try {
      if (typeof window !== "undefined" && "FontFace" in window) {
        const fontFace = new FontFace("Arizonia", "url(/fonts/Arizonia-Regular.ttf)");
        const loadedFont = await fontFace.load();
        document.fonts.add(loadedFont);
      }
      if ("fonts" in document) {
        await document.fonts.load("400px Arizonia");
        await document.fonts.load("48px 'Segoe UI', system-ui, sans-serif");
        await document.fonts.ready;
      }
    } catch (e) {
      console.warn("Font loading note:", e);
    }

    const displayName = studentName || data.username;

    let nameFontSize = 400;
    ctx.font = `${nameFontSize}px Arizonia, cursive, sans-serif`;
    const nameWidth = ctx.measureText(displayName).width;
    const maxAllowedWidth = width - 400; // 3110px
    if (nameWidth > maxAllowedWidth) {
      nameFontSize = Math.floor(nameFontSize * (maxAllowedWidth / nameWidth));
      ctx.font = `${nameFontSize}px Arizonia, cursive, sans-serif`;
    }

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(displayName, width / 2, 1460);

    // 2. Course Details
    const isPython = resolvedSlug === "python" || resolvedSlug.includes("py");
    const courseBoldText = isPython ? "PYTHON COURSE" : "HTML COURSE";
    const line1Prefix = "has successfully completed the ";
    const line2 = isPython
      ? "and has demonstrated knowledge and practical understanding of Python"
      : "and has demonstrated knowledge and practical understanding of HTML5";
    const line3 = isPython
      ? "programming fundamentals, problem-solving, and application development."
      : "document architecture, semantic elements, and web standards.";

    // Compound line 1 (Regular prefix + Bold course name)
    ctx.font = "48px 'Segoe UI', system-ui, sans-serif";
    const prefixWidth = ctx.measureText(line1Prefix).width;
    ctx.font = "bold 49px 'Segoe UI', system-ui, sans-serif";
    const boldWidth = ctx.measureText(courseBoldText).width;
    const totalLine1Width = prefixWidth + boldWidth;
    const startX = (width - totalLine1Width) / 2;

    ctx.textAlign = "left";
    ctx.font = "48px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#EDEDF5";
    ctx.fillText(line1Prefix, startX, 1740);

    ctx.font = "bold 49px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(courseBoldText, startX + prefixWidth, 1740);

    // Line 2 & Line 3 centered
    ctx.textAlign = "center";
    ctx.font = "48px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#EDEDF5";
    ctx.fillText(line2, width / 2, 1825);
    ctx.fillText(line3, width / 2, 1910);
  }, [data, studentName, resolvedSlug]);

  useEffect(() => {
    if (data?.eligible && studentName) {
      drawCertificateCanvas();
    }
  }, [data, studentName, drawCertificateCanvas]);

  const handleDownloadPdf = () => {
    const rawName = (studentName || data?.username || "xyz").toLowerCase();
    const isXyz = rawName.includes("xyz");
    const defaultPdf = isXyz
      ? (resolvedSlug === "html" ? "/certificates/certificate_xyz_html.pdf" : "/certificates/certificate_xyz_python.pdf")
      : (resolvedSlug === "html" ? "/certificates/certificate_shivang_jaiswal_html.pdf" : "/certificates/certificate_shivang_jaiswal_python.pdf");

    const link = document.createElement("a");
    link.href = defaultPdf;
    link.target = "_blank";
    link.download = `CosmoDex_Certificate_${(studentName || data?.username || "xyz").replace(/\s+/g, "_")}_${resolvedSlug}.pdf`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05060d] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <p className="font-mono text-cyan-300 text-sm tracking-wider uppercase">
            Verifying Certificate Eligibility...
          </p>
        </div>
      </div>
    );
  }

  if (!data?.eligible) {
    const coursePath = resolvedSlug === "python" ? "/learn/python" : `/learn/${resolvedSlug}`;
    const completedCount = data?.completedModules || 0;
    const totalCount = data?.totalModules || 9;
    const pct = Math.min(100, Math.round((completedCount / (totalCount || 1)) * 100));

    return (
      <div className="min-h-screen bg-[#05060d] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <Starfield />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-3xl border border-white/10 bg-[#0a0c1a]/90 p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl relative z-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center">
            <Lock size={32} className="text-amber-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black font-mono uppercase tracking-wider text-white">
              Certificate Locked
            </h1>
            <p className="text-sm text-white/60">
              Complete all stations in{" "}
              <span className="text-cyan-400 font-bold">{data?.courseTitle || resolvedSlug}</span> and pass
              every knowledge check quiz (3/5) to earn your official certificate.
            </p>
          </div>

          <div className="space-y-2 bg-white/5 rounded-2xl p-4 border border-white/10 text-left">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-white/60">Curriculum Progress</span>
              <span className="text-cyan-300 font-bold">
                {completedCount} / {totalCount} Stations ({pct}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={coursePath}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-mono font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <ArrowLeft size={16} />
              <span>Return to Galaxy &amp; Complete Stations</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const coursePath = resolvedSlug === "python" ? "/learn/python" : `/learn/${resolvedSlug}`;

  return (
    <div className="min-h-screen bg-[#05060d] text-white flex flex-col items-center justify-start p-4 sm:p-8 relative overflow-x-hidden font-sans print:p-0 print:bg-black">
      <Starfield />

      {/* ── Top Bar ── */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-6 z-10 print:hidden">
        <Link
          href={coursePath}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-cyan-300 hover:text-white bg-cyan-950/40 border border-cyan-500/20 px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft size={14} />
          <span>Back to Galaxy</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono font-black text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:opacity-95 px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-[0_0_25px_rgba(255,215,0,0.4)] hover:scale-[1.02] active:scale-95"
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* ── Certificate Preview Container ── */}
      <div className="w-full max-w-6xl z-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-3xl border border-yellow-500/30 bg-gradient-to-b from-[#0a0c1a] to-[#04050a] p-2 sm:p-4 shadow-[0_0_60px_rgba(255,215,0,0.18)] relative overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-auto rounded-2xl shadow-2xl block border border-white/10"
            style={{ aspectRatio: "3510 / 2482" }}
          />
        </motion.div>
      </div>

      {/* ── Name Confirmation Modal (Asked ONCE upon completion) ── */}
      <AnimatePresence>
        {isNameModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg rounded-3xl border border-yellow-500/40 bg-gradient-to-b from-[#0e0c24] via-[#09081a] to-[#05040f] p-6 sm:p-8 space-y-6 shadow-[0_0_60px_rgba(255,215,0,0.25)] relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center mx-auto text-yellow-300">
                <Award size={34} />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black font-mono text-white uppercase tracking-wider">
                  Claim Your Certificate 🌟
                </h3>
                <p className="text-xs sm:text-sm font-sans text-white/70 leading-relaxed">
                  Congratulations on conquering all curriculum stations! Enter your exact official full name
                  to be minted on your certificate in custom calligraphy.
                </p>
              </div>

              <form onSubmit={handleConfirmName} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
                    Official Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="e.g. Shivang Jaiswal"
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-cyan-500/40 focus:border-[#00FFE9] text-white font-mono text-base placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#00FFE9]/30 transition-all"
                  />
                  <p className="text-[11px] text-white/40 font-mono">
                    This name will appear on your certificate and verification link.
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSavingName || !inputName.trim()}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:opacity-95 text-black font-mono font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(255,215,0,0.4)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} />
                    <span>{isSavingName ? "Minting Certificate..." : "Mint & Celebrate 🚀"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

