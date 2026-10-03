import React from "react";
import Link from "next/link";
import { Project } from "../../types/api";
import { formatLocation } from "../../lib/utils/location";

interface ProjectCardProps {
  project: Project;
  onDelete?: (e: React.MouseEvent) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Tanggal tidak diketahui";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <article className="h-full bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <Link
        href={`/projects/${project.id}`}
        className="group block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
      >
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 leading-tight">
          {project.building_type}
        </h3>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{formatLocation(project.location)}</span>
          </div>
        </div>
      </Link>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Dibuat</span>
          <span className="text-sm font-medium text-slate-700">{formatDate(project.created_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${project.id}`}
            className="text-xs font-semibold text-slate-700 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded px-2 py-1"
          >
            Buka project
          </Link>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              aria-label={`Hapus project ${project.building_type}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
