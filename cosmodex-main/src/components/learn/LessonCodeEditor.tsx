"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import {
  Play,
  RotateCcw,
  Terminal,
  Eye,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { LessonFile, LessonKind } from "@/data/lessons";

type RunStatus = "IDLE" | "RUNNING" | "SUCCESS" | "ERROR";

interface RunMessage {
  type: "cosmodex-run";
  ok: boolean;
  logs: string[];
  error: string | null;
}

interface LogMessage {
  type: "cosmodex-log";
  level: string;
  line: string;
}

interface LoadedMessage {
  type: "cosmodex-loaded";
}

interface LessonCodeEditorProps {
  kind: LessonKind;
  files: LessonFile[];
}

/**
 * Shared script embedded in every sandboxed preview. It:
 *  - intercepts console calls, forwarding each line live to the parent
 *  - runs a handshake with the parent: posts "cosmodex-loaded", waits for the
 *    parent's "cosmodex-ready" reply (proving the parent's message listener is
 *    armed), then executes the user code. A 1.5s fallback covers the case
 *    where the sandbox ran before the parent mounted (SSR/hydration) and the
 *    handshake message was lost.
 */
const RUNNER_PREAMBLE = `
  var logs = [];
  function stringify(a) {
    try { return typeof a === "object" ? JSON.stringify(a) : String(a); }
    catch (e) { return String(a); }
  }
  function capture(method) {
    var original = console[method].bind(console);
    console[method] = function () {
      var line = Array.prototype.map.call(arguments, stringify).join(" ");
      logs.push(line);
      try {
        parent.postMessage({ type: "cosmodex-log", level: method, line: line }, "*");
      } catch (e) {}
      original.apply(null, arguments);
    };
  }
  ["log", "info", "warn", "error"].forEach(capture);
  function report(ok, error) {
    parent.postMessage({
      type: "cosmodex-run",
      ok: ok,
      logs: logs.slice(),
      error: error || null,
    }, "*");
  }
  var started = false;
  function start() {
    if (started) return;
    started = true;
    try {
      runUserCode();
      report(true, null);
    } catch (e) {
      report(false, (e && e.message) || String(e));
    }
  }
  parent.postMessage({ type: "cosmodex-loaded" }, "*");
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "cosmodex-ready") start();
  });
  setTimeout(start, 1500);
`;

/**
 * Builds the sandboxed document for a canvas lesson: the user's JS paints on a
 * 640×400 canvas via setup() / draw() hooks.
 */
function buildCanvasRunnerHtml(code: string): string {
  const safeCode = code.replace(/<\/script>/gi, "<\\/script>");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; height: 100%; background: #0b0a10; overflow: hidden; }
  #stage {
    display: flex; align-items: center; justify-content: center;
    height: 100%; padding: 16px; box-sizing: border-box;
  }
  canvas {
    background: #13111c;
    border-radius: 12px;
    box-shadow: 0 0 40px rgba(217, 95, 209, 0.18), 0 8px 32px rgba(0, 0, 0, 0.5);
    max-width: 100%;
    height: auto;
  }
</style>
</head>
<body>
<div id="stage"><canvas id="c" width="640" height="400"></canvas></div>
<script>
(function () {
  var canvas = document.getElementById("c");
  var ctx = canvas.getContext("2d");
  var rafId = null;
  function runUserCode() {
    ${safeCode}
    if (typeof setup === "function") setup(canvas, ctx);
    if (typeof draw === "function") {
      var runFrame = function () {
        try {
          draw(canvas, ctx);
          rafId = requestAnimationFrame(runFrame);
        } catch (e) {
          report(false, (e && e.message) || String(e));
        }
      };
      rafId = requestAnimationFrame(runFrame);
    }
  }
  window.addEventListener("beforeunload", function () {
    if (rafId) cancelAnimationFrame(rafId);
  });
  ${RUNNER_PREAMBLE}
})();
<\/script>
</body>
</html>`;
}

/**
 * Builds the sandboxed document for a webpage lesson: combines the user's
 * HTML fragment, CSS and JS into one real page.
 */
function buildWebpageRunnerHtml(files: Record<string, string>): string {
  const html = (files["index.html"] || "").replace(/<\/script/gi, "<\\/script");
  const css = files["style.css"] || "";
  const js = (files["script.js"] || "").replace(/<\/script/gi, "<\\/script");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; }
  * { box-sizing: border-box; }
  ${css}
</style>
</head>
<body>
${html}
<script>
(function () {
  function runUserCode() {
    ${js}
  }
  ${RUNNER_PREAMBLE}
})();
<\/script>
</body>
</html>`;
}

function toContents(files: LessonFile[]): Record<string, string> {
  return Object.fromEntries(files.map((f) => [f.name, f.content]));
}

export default function LessonCodeEditor({ kind, files }: LessonCodeEditorProps) {
  const starterContents = useMemo(() => toContents(files), [files]);
  const firstFile = files[0]?.name ?? "main.js";

  const [fileContents, setFileContents] =
    useState<Record<string, string>>(starterContents);
  // The exact contents the current preview was built from — initialised to the
  // starter files so the preview auto-runs on first load.
  const [lastRunContents, setLastRunContents] =
    useState<Record<string, string>>(starterContents);
  const [activeFile, setActiveFile] = useState(firstFile);
  const [runId, setRunId] = useState(1);
  const [status, setStatus] = useState<RunStatus>("IDLE");
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "console">("preview");

  // Keep the latest contents available to the run handlers
  const contentsRef = useRef(fileContents);
  useEffect(() => {
    contentsRef.current = fileContents;
  }, [fileContents]);

  const activeLanguage =
    files.find((f) => f.name === activeFile)?.language ?? "javascript";

  const runnerHtml = useMemo(() => {
    if (kind === "webpage") return buildWebpageRunnerHtml(lastRunContents);
    return buildCanvasRunnerHtml(lastRunContents["main.js"] || "");
  }, [kind, lastRunContents]);

  // Listen for messages from the sandboxed iframe. Runs as a LAYOUT effect so
  // the listener is attached as early as possible (before the srcdoc iframe's
  // script can execute on a fresh client navigation). The iframe handshake
  // ("cosmodex-loaded" → "cosmodex-ready") guarantees the listener is armed
  // before the user code runs and reports back.
  useLayoutEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data as RunMessage | LogMessage | LoadedMessage | undefined;
      if (!data) return;
      if (data.type === "cosmodex-log") {
        setLogs((prev) => [...prev, data.line]);
      } else if (data.type === "cosmodex-run") {
        setLogs(data.logs || []);
        setError(data.error);
        setStatus(data.ok ? "SUCCESS" : "ERROR");
      } else if (data.type === "cosmodex-loaded") {
        // The sandbox is up and listening — tell it to run the user code
        (e.source as Window | null)?.postMessage({ type: "cosmodex-ready" }, "*");
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const run = useCallback((contents: Record<string, string>) => {
    setLastRunContents(contents);
    setRunId((r) => r + 1);
    setStatus("RUNNING");
    setLogs([]);
    setError(null);
    setActiveTab("preview");
  }, []);

  const handleRun = useCallback(() => {
    run(contentsRef.current);
  }, [run]);

  const handleReset = useCallback(() => {
    setFileContents(starterContents);
    run(starterContents);
  }, [starterContents, run]);

  const handleFileChange = useCallback(
    (name: string, value: string) => {
      setFileContents((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const statusColor =
    status === "SUCCESS"
      ? "text-[#3DCB7F]"
      : status === "ERROR"
        ? "text-[#E85D5D]"
        : status === "RUNNING"
          ? "text-[#F5C842]"
          : "text-white/40";

  const statusLabel =
    status === "SUCCESS"
      ? "SUCCESS"
      : status === "ERROR"
        ? "ERROR"
        : status === "RUNNING"
          ? "RUNNING"
          : "IDLE";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#1b263b] bg-[#090e1a] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b263b] bg-[#0b1220] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E873C3]/15 text-[12px] font-bold text-[#E873C3]">
            {"</>"}
          </span>

          {/* File tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {files.map((f) => (
              <button
                key={f.name}
                onClick={() => setActiveFile(f.name)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 font-mono text-[11px] font-bold transition-all ${
                  activeFile === f.name
                    ? "border-[#E873C3]/40 bg-[#E873C3]/15 text-[#E873C3]"
                    : "border-transparent text-[#64748b] hover:bg-white/5 hover:text-white/80"
                }`}
                title={f.name}
              >
                {f.name}
              </button>
            ))}
          </div>

          <span className="hidden rounded-md border border-[#E873C3]/30 bg-[#E873C3]/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#E873C3] sm:inline-block">
            {activeLanguage}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-[#64748b]">
            {(fileContents[activeFile] || "").length} chars
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-[#22314e] bg-[#131d31] px-3 py-1.5 text-[11px] font-bold text-[#94a3b8] transition-all hover:border-white/40 hover:text-white active:scale-95"
            title="Reset all files"
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={handleRun}
            className="cosmo-btn-primary !rounded-lg px-4 py-1.5 text-[12px] font-bold"
            title="Run (Ctrl/Cmd + Enter)"
          >
            {status === "RUNNING" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
            Run
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="h-[320px] w-full border-b border-[#1b263b]">
        <Editor
          height="100%"
          language={activeLanguage}
          theme="cosmodex-dark"
          beforeMount={(monaco: Monaco) => {
            monaco.editor.defineTheme("cosmodex-dark", {
              base: "vs-dark",
              inherit: true,
              rules: [
                { token: "comment", foreground: "6B6A85", fontStyle: "italic" },
                { token: "keyword", foreground: "E873C3" },
                { token: "string", foreground: "00FFE9" },
                { token: "number", foreground: "F5C842" },
                { token: "type", foreground: "C453D6" },
                { token: "function", foreground: "9DE1FF" },
                { token: "delimiter", foreground: "A9A8BE" },
              ],
              colors: {
                "editor.background": "#0a0812",
                "editorGutter.background": "#0a0812",
                "editor.lineHighlightBackground": "#140f22",
                "editor.selectionBackground": "rgba(217, 95, 209, 0.25)",
                "editorCursor.foreground": "#E873C3",
                "editorLineNumber.foreground": "#3a3650",
                "editorLineNumber.activeForeground": "#E873C3",
                "editorIndentGuide.background1": "#1c1930",
                "editorWidget.background": "#13111c",
              },
            });
          }}
          onMount={(editor, monaco: Monaco) => {
            monaco.editor.setTheme("cosmodex-dark");
            const monoFamily = getComputedStyle(
              document.documentElement
            ).getPropertyValue("--font-mono").trim();
            editor.updateOptions({
              fontFamily: monoFamily ? `"${monoFamily}", monospace` : "monospace",
            });
            editor.focus();
            // Ctrl/Cmd + Enter runs the code
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
              handleRun();
            });
          }}
          value={fileContents[activeFile] ?? ""}
          onChange={(val: string | undefined) =>
            handleFileChange(activeFile, val || "")
          }
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 22,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            tabSize: 2,
            insertSpaces: true,
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoIndent: "full",
            formatOnType: true,
            padding: { top: 14, bottom: 14 },
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
        />
      </div>

      {/* Output Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-[#1b263b] bg-[#0b1220] px-4">
        <div className="flex items-center gap-1">
          {(
            [
              { key: "preview", label: "Preview", icon: <Eye size={13} /> },
              { key: "console", label: "Console", icon: <Terminal size={13} /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab.key
                  ? "border-[#E873C3] text-white"
                  : "border-transparent text-[#64748b] hover:text-white/80"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <span
          className={`flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider ${statusColor}`}
        >
          {status === "RUNNING" ? (
            <Loader2 size={12} className="animate-spin" />
          ) : status === "SUCCESS" ? (
            <CheckCircle2 size={12} />
          ) : status === "ERROR" ? (
            <AlertTriangle size={12} />
          ) : (
            <span className="inline-block h-2 w-2 rounded-full bg-white/30" />
          )}
          {statusLabel}
        </span>
      </div>

      {/* Preview / Console Body */}
      <div className="h-[320px] bg-[#0b0a10]">
        {activeTab === "preview" ? (
          <div className="relative h-full w-full">
            {/* subtle grid overlay to frame the preview */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <iframe
              key={runId}
              srcDoc={runnerHtml}
              title="Live preview"
              sandbox="allow-scripts"
              className={`relative z-10 h-full w-full border-0 ${
                kind === "canvas" ? "pointer-events-none" : ""
              }`}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed">
            {status === "RUNNING" ? (
              <p className="text-[#F5C842]">⏳ Running your code…</p>
            ) : status === "SUCCESS" && logs.length === 0 ? (
              <p className="text-[#3DCB7F]">
                ✓ Ran successfully — check the preview tab to see your page.
              </p>
            ) : (
              <>
                {error && (
                  <p className="mb-2 border-l-2 border-[#E85D5D] bg-[#E85D5D]/10 px-3 py-2 text-[#fca5a5]">
                    ✖ {error}
                  </p>
                )}
                {logs.length === 0 ? (
                  <p className="text-white/40">
                    Press Run to see console output here.
                  </p>
                ) : (
                  logs.map((line, i) => (
                    <p key={i} className="text-[#a9a8be]">
                      <span className="mr-2 select-none text-[#64748b]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {line}
                    </p>
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
