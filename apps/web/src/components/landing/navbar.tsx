'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useAuthStore } from '../../store/auth.store';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { session } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-xs'
          : 'bg-white/70 backdrop-blur-xs border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus:outline-hidden focus:ring-2 focus:ring-sky-500 rounded-xl"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-sky-400 font-black shadow-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight">
            GridTwin <span className="text-sky-600 font-bold text-xs uppercase tracking-wider ml-0.5">AI</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600" aria-label="Main Navigation">
          <a href="#product" className="hover:text-slate-900 transition-colors py-1">Produk</a>
          <a href="#workflow" className="hover:text-slate-900 transition-colors py-1">Cara Kerja</a>
          <a href="#demo" className="hover:text-slate-900 transition-colors py-1">Contoh Hasil</a>
          <a href="#methodology" className="hover:text-slate-900 transition-colors py-1">Metodologi</a>
        </nav>

        <div className="hidden sm:flex items-center gap-3">
          {!session ? (
            <>
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  Masuk
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/register"
                  className="px-4.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-900 shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  Daftar
                </Link>
              </motion.div>
            </>
          ) : (
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/dashboard"
                className="px-4.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                Buka Dashboard
              </Link>
            </motion.div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-expanded={isMobileOpen}
          aria-label="Toggle Mobile Menu"
          className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMobileOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 text-sm font-semibold text-left shadow-lg">
          <a href="#product" onClick={() => setIsMobileOpen(false)} className="block py-1.5 text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">Produk</a>
          <a href="#workflow" onClick={() => setIsMobileOpen(false)} className="block py-1.5 text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">Cara Kerja</a>
          <a href="#demo" onClick={() => setIsMobileOpen(false)} className="block py-1.5 text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">Contoh Hasil</a>
          <a href="#methodology" onClick={() => setIsMobileOpen(false)} className="block py-1.5 text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">Metodologi</a>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 mt-2">
            {!session ? (
              <>
                <Link href="/login" className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold">
                  Masuk
                </Link>
                <Link href="/register" className="w-full text-center py-2.5 rounded-xl bg-slate-950 text-white text-xs font-semibold">
                  Daftar
                </Link>
              </>
            ) : (
              <Link href="/dashboard" className="w-full text-center py-2.5 rounded-xl bg-slate-950 text-white text-xs font-semibold">
                Buka Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
