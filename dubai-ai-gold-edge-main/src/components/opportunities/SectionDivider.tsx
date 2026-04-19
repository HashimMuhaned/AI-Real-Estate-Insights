import React from "react";

export default function SectionDivider() {
  return (
    <div className="flex items-center gap-4 my-14">
      <div className="flex-1 h-px bg-border" />
      <div className="w-2.5 h-2.5 rotate-45 rounded-sm bg-accent" />
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}