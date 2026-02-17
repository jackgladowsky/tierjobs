import { Suspense } from 'react';
import { TierListMaker } from '@/components/tier-list-maker';
import { Layers, Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Tier List Maker - TierJobs',
  description: 'Create and share your own tech company tier list.',
};

function TierListLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
        <Loader2 className="relative h-10 w-10 animate-spin text-violet-400" />
      </div>
      <p className="mt-4 text-white/50">Loading tier list...</p>
    </div>
  );
}

export default function TierListPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-violet-500/10">
              <Layers className="h-6 w-6 text-violet-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Company Tier List
            </h1>
          </div>
          <p className="text-white/50 max-w-xl mx-auto">
            Rank tech companies by prestige. Drag and drop to create your own tier list, then share it on Twitter.
          </p>
        </div>

        {/* Tier list maker */}
        <Suspense fallback={<TierListLoading />}>
          <TierListMaker />
        </Suspense>
      </div>
    </div>
  );
}
