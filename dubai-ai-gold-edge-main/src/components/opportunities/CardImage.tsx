import React from "react";

export default function CardImage({ src, alt }) {
  return (
    <div className="w-full h-44 rounded-t-2xl overflow-hidden bg-secondary relative shrink-0">
      {src && (
        <img src={src} alt={alt} className="w-full h-full object-cover block" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 40%, rgba(8,20,40,0.55) 100%)",
        }}
      />
    </div>
  );
}