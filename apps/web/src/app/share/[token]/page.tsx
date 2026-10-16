import React from 'react';
import type { Metadata } from 'next';
import { PublicDecisionBrief } from '../../../components/share/public-decision-brief';

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: 'Ringkasan Keputusan Investasi Energi | GridTwin AI',
  description:
    'Ringkasan keputusan investasi energi terbarukan dan efisiensi energi yang disimulasikan melalui GridTwin AI.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function PublicSharePage({ params }: SharePageProps) {
  const { token } = await params;

  return (
    <main className="min-h-screen bg-slate-100/70">
      <PublicDecisionBrief token={token} />
    </main>
  );
}
