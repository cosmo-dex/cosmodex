"use client";

/**
 * TEMPORARY preview route — renders MatchmakingPanel in its idle state with
 * mock props so the UI can be viewed without auth / socket / database.
 * Safe to delete: src/app/preview/
 */
import MatchmakingPanel from "@/components/battle/MatchmakingPanel";

export default function PreviewMatchmakingPage() {
  return (
    <div className="relative min-h-screen bg-[#050508] text-white flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Background glows mirroring the real /battle page */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#050508]" />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(124,58,237,0.22)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(232,115,195,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(141,55,214,0.08)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full">
        <MatchmakingPanel
          socket={null}
          userId="preview-user"
          username="Explorer"
          onMatchFound={() => {}}
        />
      </div>
    </div>
  );
}
