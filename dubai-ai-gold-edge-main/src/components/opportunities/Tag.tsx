import React from "react";

export default function Tag({ label, color }) {
  const base =
    "text-[11px] tracking-widest uppercase px-3 py-0.5 rounded-full whitespace-nowrap font-bold";

  if (color === "gold") {
    return (
      <span
        className={base}
        style={{
          background:
            "linear-gradient(135deg, hsl(45,85%,55%), hsl(40,80%,62%))",
          color: "hsl(210,80%,10%)",
        }}
      >
        {label}
      </span>
    );
  }

  if (color === "emerald") {
    return (
      <span
        className={`${base} bg-emerald-50 text-emerald-800 border border-emerald-300`}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={base}
      style={{ background: "hsl(210,80%,12%)", color: "hsl(35,20%,94%)" }}
    >
      {label}
    </span>
  );
}