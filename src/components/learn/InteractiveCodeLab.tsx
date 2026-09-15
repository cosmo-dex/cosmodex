"use client";

import { useState } from "react";
import { Check, Copy, Play, Terminal, ChevronRight, FileCode2 } from "lucide-react";

interface InteractiveCodeLabProps {
  title?: string;
  inputCode: string;
  outputCode: string;
  explanation?: string;
  fileName?: string;
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
    }, 600);
  };

  const inputLines = inputCode.split("\n");

  const formatCodeLine = (line: string) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) {
      return <span className="text-slate-500 italic">{line}</span>;
    }

    const keywordRegex =
      /\b(def|class|if|elif|else|for|while|return|import|from|in|and|or|not|True|False|None|print|input|len|range|int|str|float|list|dict|set|tuple)\b/g;
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
            "True", "False", "None",
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

  const isHtml = fileName.toLowerCase().endsWith('.html');

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
            <FileCode2 size={12} className="text-[#E873C3]" />
            <span className="text-[12px] text-white/80 font-semibold">{fileName}</span>
            {title && (
              <span className="hidden sm:inline text-[11px] text-white/35 font-sans ml-1">
                — {title}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00FFE9]/10 hover:bg-[#00FFE9]/20 border border-[#00FFE9]/30 hover:border-[#00FFE9]/60 text-[#00FFE9] text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-[0_0_12px_rgba(0,255,233,0.15)]"
          >
            <Play size={10} className={isRunning ? "animate-spin" : "fill-[#00FFE9]"} />
            <span>{isRunning ? "Running…" : "Run"}</span>
          </button>

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

      {/* ── Split: Code | Output ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
        {/* LEFT – Input Code */}
        <div className="relative bg-[#0a0c18] overflow-x-auto">
          <div className="px-2 py-2 border-b border-white/[0.06] bg-[#0d1020] flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#E873C3] uppercase tracking-widest">
              Input
            </span>
          </div>
          <div className="p-4 text-[13px] leading-6 text-slate-200 min-h-[100px]">
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

        {/* RIGHT – Output */}
        <div className="bg-[#06080f] flex flex-col">
          <div className="px-4 py-2 border-b border-white/[0.06] bg-[#080b17] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={11} className="text-[#00FFE9]" />
              <span className="text-[10px] font-mono font-bold text-[#00FFE9] uppercase tracking-widest">
                Output
              </span>
              {hasExecuted && !isRunning && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-mono text-white/25">
              exit: 0
            </span>
          </div>
          <div className="p-4 flex-1 text-[13px] font-mono leading-6 min-h-[100px] flex flex-col">
            {isRunning ? (
              <span className="text-[#00FFE9] animate-pulse">Executing…</span>
            ) : hasExecuted ? (
              <div className="flex flex-col gap-3 h-full">
                {isHtml && (
                  <div className="flex-1 bg-white/90 rounded overflow-hidden p-1 min-h-[150px]">
                    <iframe
                      srcDoc={inputCode}
                      title="HTML Preview"
                      sandbox="allow-scripts"
                      className="w-full h-full bg-white rounded-sm"
                    />
                  </div>
                )}
                {outputCode && !isHtml && (
                  <span className="text-emerald-300 whitespace-pre-wrap">{outputCode}</span>
                )}
                {outputCode && isHtml && (
                  <div className="text-emerald-300/80 text-[11px] mt-auto pt-2 border-t border-white/10 whitespace-pre-wrap">
                    <span className="text-white/50 font-bold">Note: </span>
                    {outputCode}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-white/30 italic text-xs">Click Run ▶ to see output</span>
            )}
          </div>
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
