"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Gauge = ({ value = 0, size = 120, stroke = 12 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <g transform={`rotate(-90 ${center} ${center})`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={stroke}
          stroke="var(--muted)"
          fill="none"
          opacity="0.12"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            color: value >= 70 ? "#16a34a" : value >= 40 ? "#d97706" : "#dc2626",
          }}
        />
      </g>
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-semibold"
        style={{ fontSize: 18 }}
      >
        {value}
      </text>
    </svg>
  );
};

const DriverCard = ({ driver }) => {
  const { driver: name, contribution } = driver;

  const labelMap = {
    yield: "Yield",
    yoy_change: "Momentum (YoY)",
    volatility: "Volatility",
    txn_volume: "Transaction Volume",
    time_on_market: "Time-on-market",
    supply_pipeline_count: "Supply pipeline",
    developer_reliability: "Developer reliability",
  };

  return (
    <div className="p-3 bg-white rounded-md shadow-sm w-full">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral/10 flex items-center justify-center text-sm font-bold">
          {labelMap[name]?.split(" ").map(s => s[0]).slice(0, 2).join("")}
        </div>
        <div>
          <div className="text-sm font-semibold">{labelMap[name] || name}</div>
          <div className="text-xs text-muted-foreground">
            Contribution: {(contribution * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

const InvestmentScore = ({ areaName, propertyType = "apartments" }) => {
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState(null);

  useEffect(() => {
    if (!areaName) return;

    let cancelled = false;

    const fetchScore = async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams({ areaName, propertyType }).toString();
        const res = await fetch(`http://localhost:8080/api/investment-score?${q}`);
        const data = await res.json();

        if (!cancelled) {
          setScoreData(data.investmentScore || data);
        }
      } catch (err) {
        if (!cancelled) console.error("Failed to fetch investment score", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchScore();

    return () => {
      cancelled = true; // <- FIX
    };
  }, [areaName, propertyType]);

  if (loading) {
    return <div className="p-4">Loading investment score…</div>;
  }
  if (!scoreData) {
    return <div className="p-4 text-sm text-muted-foreground">No score available</div>;
  }

  const { score, label, drivers = [], ai_explanation } = scoreData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-start">
      <div className="flex flex-col items-center gap-2">
        <Gauge value={score} size={140} stroke={14} />
        <div
          className={cn(
            "text-sm font-semibold",
            label === "Buy"
              ? "text-emerald-600"
              : label === "Hold"
              ? "text-yellow-600"
              : "text-red-600"
          )}
        >
          {label}
        </div>
        <div className="text-xs text-muted-foreground">Investment Score</div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {drivers.map((d, i) => (
            <DriverCard key={i} driver={d} />
          ))}
        </div>

        {ai_explanation && (
          <div className="p-3 bg-white rounded-md shadow-sm">
            <div className="text-sm font-semibold mb-1">Analyst note</div>

            {ai_explanation.summary && <div className="text-sm">{ai_explanation.summary}</div>}

            {ai_explanation.bullets && (
              <ul className="list-disc ml-5 mt-2 text-sm">
                {ai_explanation.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentScore;
