import React from 'react';
import Link from 'next/link';
import { ProjectSetupWizard } from '../../../components/project-setup/project-setup-wizard';

export const metadata = {
  title: 'Project Setup | GridTwin AI',
  description: 'Configure your building baseline parameters to generate an energy twin.',
};

export default function ProjectSetupPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between py-8 px-4 sm:px-6">
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2 text-slate-900 font-bold text-lg tracking-tight">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span>GridTwin AI</span>
        </Link>

        <div className="flex items-center gap-4 text-slate-400">
          <button type="button" aria-label="Help" className="hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button type="button" aria-label="Settings" className="hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <ProjectSetupWizard />
      </main>

      <footer className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 pt-6 gap-2">
        <span>© 2026 GridTwin AI. Professional Energy Decision Intelligence.</span>
        <div className="flex gap-4">
          <Link href="#" className="hover:text-slate-600">Privacy Policy</Link>
          <Link href="#" className="hover:text-slate-600">Terms of Service</Link>
          <Link href="#" className="hover:text-slate-600">Support</Link>
        </div>
      </footer>
    </div>
  );
}