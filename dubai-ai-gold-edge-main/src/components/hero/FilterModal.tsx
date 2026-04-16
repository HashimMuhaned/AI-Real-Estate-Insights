"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";


export const FILTERS = {
  invest: [
    { id: "type",     label: "Property Type",  options: ["Apartment","Villa","Townhouse","Studio"] },
    { id: "bedrooms", label: "Bedrooms",        options: ["Studio","1BR","2BR","3BR","4BR+"] },
    { id: "budget",   label: "Budget",          options: ["Under 500K","500K–1M","1M–2M","2M+"] },
    { id: "area",     label: "Area",            options: ["JVC","Dubai Hills","Marina","Business Bay","Downtown"] },
  ],
  buy: [
    { id: "budget",   label: "Budget",  options: ["Under 500K","500K–1M","1M–2M","2M+"] },
    { id: "status",   label: "Status",  options: ["Off-plan","Ready"] },
    { id: "bedrooms", label: "Bedrooms",options: ["Studio","1BR","2BR","3BR","4BR+"] },
  ],
  rent: [
    { id: "type",     label: "Property Type",   options: ["Apartment","Villa","Studio"] },
    { id: "bedrooms", label: "Bedrooms",         options: ["Studio","1BR","2BR","3BR","4BR+"] },
    { id: "budget",   label: "Annual Budget",    options: ["Under 50K","50K–80K","80K–120K","120K+"] },
    { id: "area",     label: "Area",             options: ["JVC","Marina","JBR","Deira","Silicon Oasis"] },
  ],
  explore: [
    { id: "txtype", label: "Transaction Type", options: ["Sold","Rented"] },
    { id: "area",   label: "Area",             options: ["All Dubai","Downtown","Marina","Business Bay"] },
    { id: "range",  label: "Time Range",       options: ["Last 30 days","Last 90 days","Last 12 months"] },
  ],
};

export default function FilterModal({ mode, selected, onChange, onClose }) {
  const fields = FILTERS[mode];
  const toggle = (id, opt) => onChange(p => ({ ...p, [id]: p[id]===opt ? "" : opt }));
  const count = Object.values(selected).filter(Boolean).length;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const content = (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.22 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor:"rgba(2,8,20,0.82)", backdropFilter:"blur(12px)" }}
      onClick={(e) => { if (e.target===e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ opacity:0, y:48, scale:0.93 }} animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:32, scale:0.95 }}
        transition={{ type:"spring", stiffness:340, damping:28 }}
        className="relative w-full max-w-lg bg-[#070e1c] border border-white/[0.09] rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-yellow-400/[0.08] blur-3xl rounded-full pointer-events-none" />
        <div className="relative flex items-start justify-between px-7 pt-7 pb-5">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Smart Filters</h3>
            <p className="text-xs text-white/35 mt-1">Refining for <span className="text-yellow-400 font-bold capitalize">{mode}</span> mode</p>
          </div>
          <motion.button whileHover={{ scale:1.1, rotate:90 }} whileTap={{ scale:0.9 }} transition={{ duration:0.2 }} onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="mx-7 h-px bg-white/[0.05]" />
        <div className="px-7 py-6 space-y-6 max-h-[55vh] overflow-y-auto">
          {fields.map((field, fi) => (
            <motion.div key={field.id} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:fi*0.07 }}>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em] mb-3">{field.label}</p>
              <div className="flex flex-wrap gap-2">
                {field.options.map(opt => {
                  const active = selected[field.id]===opt;
                  return (
                    <motion.button key={opt} onClick={() => toggle(field.id, opt)} whileTap={{ scale:0.93 }}
                      className={`relative text-sm px-4 py-2 rounded-xl border font-semibold transition-all duration-200 overflow-hidden ${active ? "text-black border-yellow-400 bg-yellow-400" : "border-white/10 text-white/55 hover:border-white/25 hover:text-white bg-transparent"}`}>
                      <span className="relative z-10">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mx-7 h-px bg-white/[0.05]" />
        <div className="px-7 py-5 flex items-center justify-between">
          <button onClick={() => onChange({})} className="text-sm text-white/35 hover:text-white transition-colors font-medium">Clear all</button>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {count > 0 && <motion.span initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }} className="text-xs text-yellow-400 font-bold">{count} applied</motion.span>}
            </AnimatePresence>
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={onClose}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-6 py-2.5 rounded-xl text-sm transition-colors">Apply Filters</motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
  return createPortal(content, document.body);
}