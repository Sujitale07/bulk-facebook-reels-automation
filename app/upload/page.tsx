import { UploadForm } from '@/components/UploadForm';
import { VideoGallery } from '@/components/VideoGallery';
import { prisma } from '@/lib/prisma';
import { Terminal, HardDrive } from 'lucide-react';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export default async function UploadPage() {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-red-500 font-mono text-xs uppercase tracking-widest">
         [FATAL_ERROR: UNAUTHORIZED_ACCESS]
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-mono p-8 space-y-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <Terminal className="h-4 w-4 text-muted" />
                    <h1 className="text-sm font-bold uppercase tracking-[0.5em] text-foreground">ASSET_ACQUISITION_TERMINAL</h1>
                </div>
                <p className="text-[10px] text-muted tracking-widest uppercase">Buffer ingestion and structural indexing of digital motion artifacts.</p>
            </div>
        </div>

        {/* UPLOAD SECTION */}
        <section className="space-y-6">
           <UploadForm userId={user.id} />
        </section>

        {/* LIBRARY SECTION */}
        <section className="space-y-6 pt-8 border-t border-white/5">
           <VideoGallery userId={user.id} />
        </section>
      </div>
    </div>
  );
}
