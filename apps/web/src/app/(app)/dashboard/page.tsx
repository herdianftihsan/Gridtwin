import React from "react";
import { AuthGuard } from "../../../components/auth/auth-guard";
import { DashboardHeader } from "../../../components/dashboard/dashboard-header";
import { ProjectDashboard } from "../../../components/dashboard/project-dashboard";

export const metadata = {
  title: "Dashboard | GridTwin AI",
  description: "Manage your energy twin projects and investment scenarios.",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <AuthGuard>
        <div className="flex flex-col min-h-screen">
          <DashboardHeader />
          <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <ProjectDashboard />
          </div>
        </div>
      </AuthGuard>
    </main>
  );
}
