"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const SnapShotSection = ({ chartType, areaName, summary = [] }) => {
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    if (!chartType || !areaName || !summary) return;

    const fetchSnapshot = async () => {
      try {
        const res = await fetch(
          "http://localhost:8000/api/ai/generate/insights",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chart_type: chartType,
              context: { area: areaName, propertyType: "apartments" },
              data_summary: summary,
              mode: "snapshot",
            }),
          }
        );

        const data = await res.json();
        setSnapshot(data);
      } catch (err) {
        console.error("Snapshot fetch failed:", err);
      }
    };

    fetchSnapshot();
  }, [chartType, areaName, JSON.stringify(summary)]); 
  // 👆 reruns snapshot only if data actually changes

  return (
    <div>
      {snapshot && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold",
              snapshot.snapshotVerdict === "Good" &&
                "bg-emerald-100 text-emerald-700",
              snapshot.snapshotVerdict === "Neutral" &&
                "bg-yellow-100 text-yellow-700",
              snapshot.snapshotVerdict === "Risky" && "bg-red-100 text-red-700"
            )}
          >
            {snapshot.snapshotVerdict}
          </span>

          <div className="text-sm text-muted-foreground">
            {snapshot.snapshotReason}
          </div>
        </div>
      )}
    </div>
  );
};

export default SnapShotSection;
