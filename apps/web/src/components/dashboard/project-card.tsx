import React from "react";
import Link from "next/link";
import { Project } from "../../types/api";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Tanggal tidak diketahui";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link href={`/projects/${project.id}`} className="block group h-full">
      <div className="h-full bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-slate-300 relative overflow-hidden">
        
        {/* Top Section */}
        <div className="space-y-4 relative z-10">
          <div className="flex justify-between items-start gap-3">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 leading-tight">
              Proyek {project.building_type}
            </h3>
            <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-emerald-100 text-emerald-700 border-emerald-200`}>
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500`} />
              Aktif
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="truncate">{project.building_type || "Bangunan Komersial"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{project.location || "Jakarta, Indonesia"}</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dibuat</span>
            <span className="text-xs font-medium text-slate-700">{formatDate(project.created_at)}</span>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        {/* Decorative background accent */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </Link>
  );
}
