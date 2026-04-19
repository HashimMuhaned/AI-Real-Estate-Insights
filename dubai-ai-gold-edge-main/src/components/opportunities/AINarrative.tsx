import React from "react";

export default function AINarrative({ text }) {
  return (
    <div
      className="mt-3 px-3.5 py-2.5 rounded-r-lg"
      style={{
        background: "hsl(45,60%,97%)",
        border: "1px solid hsl(45,70%,82%)",
        borderLeft: "3px solid hsl(45,85%,52%)",
      }}
    >
      <p
        className="text-[10px] font-bold tracking-widest uppercase mb-1 flex items-center gap-1"
        style={{ color: "hsl(40,70%,36%)" }}
      >
        <span>✦</span> AI Insight
      </p>
      <p
        className="m-0 text-[13px] leading-relaxed"
        style={{ color: "hsl(210,40%,25%)" }}
      >
        {text}
      </p>
    </div>
  );
}