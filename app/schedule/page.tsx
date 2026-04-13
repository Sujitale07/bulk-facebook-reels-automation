import { prisma } from '@/lib/prisma';
import { ScheduleForm } from '@/components/ScheduleForm';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { Calendar, Terminal } from 'lucide-react';

export default async function SchedulePage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login');

  const videos = await prisma.video.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, filename: true }
  });

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-background font-mono text-foreground font-medium">
      <div className="h-16 flex items-center px-8 border-b border-white/5 bg-surface/50">
        <div className="flex items-center gap-4">
          <Calendar className="h-4 w-4 text-muted" />
          <h1 className="text-[10px] font-bold uppercase tracking-[0.2em]">DEPLOYMENT_STRATEGY_DAEMON</h1>
        </div>
      </div>

      <main className="p-8 max-w-8xl">
        <div className="space-y-12">
          <div className="space-y-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-white">ORCHESTRATION_LAYER</h2>
            <p className="text-[10px] text-muted tracking-widest uppercase italic">Distribute motion artifacts across the temporal execution vector.</p>
          </div>

          <section className="bg-surface border border-white/5 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <Terminal className="h-3 w-3 text-white/5" />
            </div>
            <ScheduleForm videos={videos} userId={user.id} />
          </section>
        </div>
      </main>
    </div>
  );
}
