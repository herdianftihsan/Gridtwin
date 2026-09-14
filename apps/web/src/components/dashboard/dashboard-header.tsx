"use client";

import React, { useState, useRef, useEffect } from "react";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../../store/auth.store";
import { AuthService } from "../../lib/auth/auth-service";

export function DashboardHeader() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userEmail = session?.user?.email || "User";
  const userInitials = userEmail.substring(0, 2).toUpperCase();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await AuthService.signOut();
    router.push("/login");
  };

  return (
    <header className="w-full h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between z-40 sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-slate-900 tracking-tight">GridTwin AI</span>
      </div>

      {/* Account Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold tracking-wider">
            {userInitials}
          </div>
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden py-1 z-50 origin-top-right"
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Masuk sebagai</p>
                <p className="text-sm font-semibold text-slate-900 truncate" title={userEmail}>
                  {userEmail}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 focus:outline-none focus:bg-red-50 transition-colors flex items-center justify-between"
                >
                  Keluar
                  <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
