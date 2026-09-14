"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { apiClient } from "../../lib/api/api-client";
import { Project } from "../../types/api";
import { ProjectCard } from "./project-card";

export function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get<Project[]>("/api/projects");
        if (isMounted) {
          setProjects(response.data || []);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Gagal memuat proyek.";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Gagal memuat proyek</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-200">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Belum ada proyek</h2>
        <p className="text-base text-slate-500 max-w-md mb-8">
          Buat proyek energi pertama Anda untuk mulai mengeksplorasi skenario solar, baterai, dan efisiensi.
        </p>
        <Link
          href="/setup"
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm transition-all flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 text-white/80 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buat Proyek
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Proyek Anda</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dan eksplorasi energy twin bangunan Anda.</p>
        </div>
        <Link
          href="/setup"
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 group"
        >
          <svg className="w-4 h-4 text-white/80 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Proyek Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
