import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { 
  Activity,
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Video,
  Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';

export default async function StatusPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login');

  const jobs = await prisma.postJob.findMany({
    where: {
      schedule: {
        userId: user.id
      }
    },
    include: {
      video: true,
      schedule: true
    },
    orderBy: {
      scheduledAt: 'desc'
    },
    take: 50
  });

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-background font-mono text-foreground font-medium">
      <div className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-surface/50">
        <div className="flex items-center gap-4">
          <Activity className="h-4 w-4 text-muted" />
          <h1 className="text-[10px] font-bold uppercase tracking-[0.2em]">SYSTEM_EXECUTION_LOG_DAEMON</h1>
        </div>
        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 transition-none">
          POLL_LIVE_DATA
        </button>
      </div>

      <main className="p-8">
        <div className="border border-white/5 bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-background/50">
                  <th className="px-6 py-3 text-[9px] font-bold text-muted uppercase tracking-[0.3em]">NODE_ID</th>
                  <th className="px-6 py-3 text-[9px] font-bold text-muted uppercase tracking-[0.3em]">TS_SCHEDULED</th>
                  <th className="px-6 py-3 text-[9px] font-bold text-muted uppercase tracking-[0.3em]">STATE</th>
                  <th className="px-6 py-3 text-[9px] font-bold text-muted uppercase tracking-[0.3em]">REEL_REF</th>
                  <th className="px-6 py-3 text-[9px] font-bold text-muted uppercase tracking-[0.3em]">IO_STREAM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-none group text-[10px]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-muted tabular font-bold text-[9px]">{job.id.substring(0, 12)}</span>
                        <span className="text-foreground/80 font-bold lowercase truncate max-w-[160px]">{job.video.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-muted tabular font-bold uppercase tracking-widest text-[9px]">
                        {format(new Date(job.scheduledAt), 'yyyy-MM-dd HH:mm:ss')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StateBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4">
                      {job.facebookPostId ? (
                        <a 
                          href={`https://facebook.com/${job.facebookPostId}`} 
                          target="_blank" 
                          className="text-foreground hover:bg-white/10 px-2 py-1 flex items-center gap-2 font-bold transition-none"
                        >
                          <span className="tabular tracking-tighter text-[9px]">FB_REF_{job.facebookPostId.substring(0, 6)}</span>
                          <ExternalLink className="h-2.5 w-2.5 text-muted" />
                        </a>
                      ) : (
                        <span className="text-muted text-[9px] font-bold tracking-widest uppercase">NULL</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[9px] text-muted max-w-[200px] truncate font-mono uppercase tracking-tighter" title={job.log || ''}>
                        {job.log || 'NO_IO_PAYLOAD'}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-32 text-center border-t border-white/5 border-dashed bg-background/50">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">AWAITING_INPUT_STREAM...</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StateBadge({ status }: { status: string }) {
  const styles = {
    success: 'text-emerald-500',
    pending: 'text-amber-500',
    processing: 'text-blue-500',
    failed: 'text-red-500',
  }[status] || 'text-muted';

  return (
    <span className={cn(
      "text-[9px] font-bold uppercase tracking-[0.2em] tabular",
      styles
    )}>
      [{status}]
    </span>
  );
}
