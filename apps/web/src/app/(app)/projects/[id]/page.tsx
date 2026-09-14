import React from "react";
import { AuthGuard } from "../../../../components/auth/auth-guard";
import { WorkspaceContainer } from "../../../../components/workspace/workspace-container";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Decision Workspace | GridTwin AI",
  description: "Simulate building energy configurations and optimize investment decisions.",
};

export default async function ProjectWorkspacePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <AuthGuard>
        <WorkspaceContainer projectId={id} />
      </AuthGuard>
    </main>
  );
}
