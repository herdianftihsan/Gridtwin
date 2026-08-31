import React from 'react';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 py-10 text-xs text-slate-400 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white text-slate-950 flex items-center justify-center font-bold text-xs">
            ⚡
          </div>
          <span className="font-extrabold text-white">GridTwin AI</span>
          <span className="text-slate-400">· Climate-Tech Decision Intelligence</span>
        </div>
        <p className="text-slate-400 text-[11px]">
          © {new Date().getFullYear()} GridTwin AI. In compliance with Permen ESDM No. 2/2024 regulations.
        </p>
      </div>
    </footer>
  );
}