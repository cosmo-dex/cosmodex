"use client";

import React, { useEffect } from "react";

export default function AdsterraNativeBanner() {
  useEffect(() => {
    const scriptId = "adsterra-native-banner-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src =
        "https://pl31257885.profitableratecpmnetwork.com/ba6cbf6be7b27882ce717d652ad0acb8/invoke.js";
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full flex justify-center items-center py-4 my-2 overflow-hidden relative z-10">
      <div id="container-ba6cbf6be7b27882ce717d652ad0acb8" />
    </div>
  );
}
