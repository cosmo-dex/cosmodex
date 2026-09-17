"use client";

import { useState, useMemo, useRef } from "react";
import {
  Check,
  Copy,
  Play,
  Terminal,
  ChevronRight,
  FileCode2,
  Globe,
  RotateCw,
  ExternalLink,
  Lock,
  Code2,
} from "lucide-react";

interface InteractiveCodeLabProps {
  title?: string;
  inputCode: string;
  outputCode: string;
  explanation?: string;
  fileName?: string;
}

function buildHtmlPreview(inputCode: string, title?: string): string {
  const code = inputCode.trim();
  const defaultStyles = `
    <style>
      :root {
        color-scheme: light;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #0f172a;
        background-color: #ffffff;
        line-height: 1.5;
        font-size: 14px;
      }
      header, nav, main, article, section, aside, footer {
        display: block;
      }
      a {
        color: #2563eb;
      }
      a:hover {
        text-decoration: underline;
      }
      code, pre {
        font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      }
      html, body {
        scrollbar-width: thin;
        scrollbar-color: rgba(158, 0, 246, 0.4) rgba(0, 0, 0, 0.05);
      }
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.04);
        border-radius: 9999px;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(158, 0, 246, 0.4);
        border-radius: 9999px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(158, 0, 246, 0.7);
      }
    </style>
    <script>
      window.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (a && a.getAttribute("href") && a.getAttribute("href").startsWith("#")) {
          e.preventDefault();
          const id = a.getAttribute("href").substring(1);
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }
      });
    </script>
  `;

  if (code.toLowerCase().includes("<head>")) {
    return code.replace(/<head>/i, `<head>${defaultStyles}`);
  } else if (code.toLowerCase().includes("<html>")) {
    return code.replace(/<html>/i, `<html><head>${defaultStyles}</head>`);
  } else if (code.toLowerCase().startsWith("<!doctype")) {
    return `${code}\n${defaultStyles}`;
  } else {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "Cosmo Preview"}</title>
  ${defaultStyles}
</head>
<body>
  ${code}
</body>
</html>`;
  }
}

export default function InteractiveCodeLab({
  title,
  inputCode,
  outputCode,
  explanation,
  fileName = "main.py",
}: InteractiveCodeLabProps) {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const isHtml = useMemo(() => {
    const lower = (fileName || "").toLowerCase();
    if (lower.endsWith(".html") || lower.endsWith(".htm")) return true;
    const trimmed = inputCode.trim().toLowerCase();
    return (
      trimmed.startsWith("<!doctype") ||
      trimmed.startsWith("<html") ||
      trimmed.includes("</html>") ||
      /<(header|nav|main|article|section|aside|footer|div|p|h[1-6]|ul|ol|li|button|form|input|table|a|span|img|body|head)\b/i.test(
        trimmed
      )
    );
  }, [fileName, inputCode]);

  const [activeTab, setActiveTab] = useState<"browser" | "terminal">(() =>
    isHtml ? "browser" : "terminal"
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(inputCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRun = () => {
    setIsRunning(true);
    setHasExecuted(false);
    setTimeout(() => {
      setIsRunning(false);
      setHasExecuted(true);
      setReloadKey((prev) => prev + 1);
    }, 450);
  };

  const handleRefresh = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setReloadKey((prev) => prev + 1);
    }, 300);
  };

  const htmlPreviewDocument = buildHtmlPreview(inputCode, title);

  const handleOpenExternal = () => {
    if (typeof window !== "undefined") {
      const blob = new Blob([htmlPreviewDocument], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  };

  const inputLines = inputCode.split("\n");

  const formatCodeLine = (line: string) => {
    const trimmed = line.trim();

    // HTML Comments
    if (trimmed.startsWith("<!--") || trimmed.endsWith("-->")) {
      return <span className="text-slate-500 italic">{line}</span>;
    }

    // Python / Bash Comments
    if (trimmed.startsWith("#")) {
      return <span className="text-slate-500 italic">{line}</span>;
    }

    // HTML / XML Syntax Highlighting
    if (isHtml || line.includes("<") || line.includes(">")) {
      const htmlRegex = /(<!--[\s\S]*?-->|<\/?[a-zA-Z0-9\-:]+|\/?>|"[^"]*"|'[^']*'|(?:\s+[a-zA-Z0-9\-:]+)(?==)|=)/g;
      const parts = line.split(htmlRegex);

      return parts.map((part, pIdx) => {
        if (!part) return null;
        if (part.startsWith("<!--")) {
          return <span key={pIdx} className="text-slate-500 italic">{part}</span>;
        }
        if (part.startsWith("<") || part === ">" || part === "/>" || part === "</") {
          return <span key={pIdx} className="text-[#E873C3] font-semibold">{part}</span>;
        }
        if (part.startsWith('"') || part.startsWith("'")) {
          return <span key={pIdx} className="text-[#00FFE9]">{part}</span>;
        }
        if (/^\s*[a-zA-Z0-9\-:]+$/.test(part)) {
          return <span key={pIdx} className="text-[#FFA249]">{part}</span>;
        }
        if (part === "=") {
          return <span key={pIdx} className="text-white/60">{part}</span>;
        }
        return <span key={pIdx} className="text-slate-200">{part}</span>;
      });
    }

    // Python / JS keywords
    const keywordRegex =
      /\b(def|class|if|elif|else|for|while|return|import|from|in|and|or|not|True|False|None|print|input|len|range|int|str|float|list|dict|set|tuple|const|let|var|function|async|await)\b/g;
    const stringRegex = /("""[\s\S]*?"""|'''[\s\S]*?'''|".*?"|'.*?'|f".*?"|f'.*?')/g;

    const parts = line.split(stringRegex);

    return parts.map((part, pIdx) => {
      if (stringRegex.test(part)) {
        stringRegex.lastIndex = 0;
        return (
          <span key={pIdx} className="text-amber-300">
            {part}
          </span>
        );
      }

      const subParts = part.split(keywordRegex);
      return subParts.map((sub, sIdx) => {
        if (
          [
            "def", "class", "if", "elif", "else", "for", "while",
            "return", "import", "from", "in", "and", "or", "not",
            "True", "False", "None", "const", "let", "var", "function", "async", "await",
          ].includes(sub)
        ) {
          return (
            <span key={sIdx} className="text-[#c678dd] font-semibold">
              {sub}
            </span>
          );
        }
        if (["print", "input", "len", "range", "int", "str", "float", "list", "dict", "set", "tuple"].includes(sub)) {
          return (
            <span key={sIdx} className="text-[#61afef]">
              {sub}
            </span>
          );
        }
        return <span key={sIdx}>{sub}</span>;
      });
    });
  };

  return (
    <div className="my-5 rounded-2xl overflow-hidden border border-white/10 bg-[#0d0f1a] shadow-[0_8px_32px_rgba(0,0,0,0.6)] font-mono">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#13162a] border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            {isHtml ? (
              <Globe size={13} className="text-[#00FFE9]" />
            ) : (
              <FileCode2 size={13} className="text-[#E873C3]" />
            )}
            <span className="text-[12px] text-white/80 font-semibold">{fileName}</span>
            {title && (
              <span className="hidden sm:inline text-[11px] text-white/35 font-sans ml-1">
                — {title}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Run Button */}
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00FFE9]/10 hover:bg-[#00FFE9]/20 border border-[#00FFE9]/30 hover:border-[#00FFE9]/60 text-[#00FFE9] text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-[0_0_12px_rgba(0,255,233,0.15)]"
          >
            <Play size={10} className={isRunning ? "animate-spin" : "fill-[#00FFE9]"} />
            <span>{isRunning ? "Running…" : "Run"}</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-white/60 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
            title="Copy Code"
          >
            {copied ? (
              <>
                <Check size={11} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Split: Code | Output / Browser ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 min-h-[300px]">
        {/* LEFT – Input Code */}
        <div
          data-lenis-prevent
          className="relative bg-[#0a0c18] overflow-hidden flex flex-col"
        >
          <div className="px-3 py-2 border-b border-white/[0.06] bg-[#0d1020] flex items-center justify-between shrink-0">
            <span className="text-[10px] font-mono font-bold text-[#E873C3] uppercase tracking-widest flex items-center gap-1.5">
              <Code2 size={12} />
              Input Code
            </span>
            <span className="text-[10px] font-mono text-white/30">
              {inputLines.length} lines
            </span>
          </div>
          <div
            data-lenis-prevent
            className="p-4 text-[13px] leading-6 text-slate-200 flex-1 overflow-y-auto overflow-x-auto max-h-[500px] cosmo-scrollbar overscroll-contain"
          >
            <div className="table w-full">
              {inputLines.map((line, idx) => (
                <div key={idx} className="table-row group">
                  <span className="table-cell pr-4 select-none text-right text-white/20 text-[11px] w-7 font-mono leading-6 align-top pt-[1px]">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre font-mono">
                    {formatCodeLine(line)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT – Browser Output or Terminal Output */}
        <div className="bg-[#06080f] flex flex-col min-h-[280px]">
          {/* Output Header with Tab Switcher if HTML */}
          <div className="px-3 py-1.5 border-b border-white/[0.06] bg-[#080b17] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              {isHtml ? (
                <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveTab("browser")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                      activeTab === "browser"
                        ? "bg-[#00FFE9]/15 text-[#00FFE9] border border-[#00FFE9]/30 shadow-[0_0_8px_rgba(0,255,233,0.2)]"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    <Globe size={11} />
                    <span>Browser</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("terminal")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                      activeTab === "terminal"
                        ? "bg-[#E873C3]/15 text-[#E873C3] border border-[#E873C3]/30 shadow-[0_0_8px_rgba(232,115,195,0.2)]"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    <Terminal size={11} />
                    <span>Console</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-1">
                  <Terminal size={11} className="text-[#00FFE9]" />
                  <span className="text-[10px] font-mono font-bold text-[#00FFE9] uppercase tracking-widest">
                    Output
                  </span>
                  {hasExecuted && !isRunning && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-white/30">
              {isHtml && activeTab === "browser" && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    title="Reload Browser Preview"
                    className="p-1 hover:text-[#00FFE9] text-white/50 transition-colors"
                  >
                    <RotateCw size={11} className={isRunning ? "animate-spin text-[#00FFE9]" : ""} />
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenExternal}
                    title="Open in new window"
                    className="p-1 hover:text-[#00FFE9] text-white/50 transition-colors"
                  >
                    <ExternalLink size={11} />
                  </button>
                </div>
              )}
              <span>{isRunning ? "compiling..." : "exit: 0"}</span>
            </div>
          </div>

          {/* Render Active View */}
          {isHtml && activeTab === "browser" ? (
            <div className="flex-1 flex flex-col bg-[#0f1220] relative overflow-hidden">
              {/* Browser Address Bar */}
              <div className="px-3 py-1.5 bg-[#171a2e] border-b border-white/[0.08] flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-black/40 border border-white/10 rounded-full flex-1 min-w-0 text-[11px] font-mono text-white/60">
                  <Lock size={10} className="text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-semibold shrink-0">https://</span>
                  <span className="truncate text-white/70">preview.cosmodex.dev/{fileName}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>LIVE</span>
                </div>
              </div>

              {/* Progress bar for running */}
              {isRunning && (
                <div className="h-0.5 w-full bg-[#00FFE9]/20 overflow-hidden shrink-0">
                  <div className="h-full bg-gradient-to-r from-[#00FFE9] to-[#E873C3] animate-pulse w-full" />
                </div>
              )}

              {/* Browser Iframe Canvas */}
              <div
                data-lenis-prevent
                className="flex-1 relative bg-white min-h-[240px] max-h-[500px] overflow-auto cosmo-scrollbar overscroll-contain"
              >
                {hasExecuted ? (
                  <iframe
                    key={reloadKey}
                    ref={iframeRef}
                    title="Cosmo HTML Live Preview"
                    srcDoc={htmlPreviewDocument}
                    sandbox="allow-scripts allow-modals allow-same-origin"
                    className="w-full h-full min-h-[240px] border-none block"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#0d0f1a] flex flex-col items-center justify-center text-center p-6 text-white/40">
                    <Globe size={24} className="mb-2 text-[#00FFE9]/60" />
                    <p className="text-xs font-mono text-white/60">HTML Preview Paused</p>
                    <p className="text-[11px] text-white/30 font-sans mt-1">Click Run ▶ to render in browser</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Terminal Text Output */
            <div
              data-lenis-prevent
              className="p-4 flex-1 text-[13px] font-mono leading-6 min-h-[140px] overflow-y-auto max-h-[500px] cosmo-scrollbar overscroll-contain"
            >
              {isRunning ? (
                <div className="flex items-center gap-2 text-[#00FFE9]">
                  <RotateCw size={13} className="animate-spin" />
                  <span className="animate-pulse">Executing code…</span>
                </div>
              ) : hasExecuted ? (
                <span className="text-emerald-300 whitespace-pre-wrap">{outputCode}</span>
              ) : (
                <span className="text-white/30 italic text-xs">Click Run ▶ to see output</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Explanation ── */}
      {explanation && (
        <div className="flex items-start gap-3 px-4 py-3 bg-[#0f1225] border-t border-white/[0.06] text-[12px] text-slate-300 leading-relaxed font-sans">
          <ChevronRight size={13} className="text-[#FFA249] shrink-0 mt-0.5" />
          <p>
            <span className="font-bold text-white mr-1">Note:</span>
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}

