import { prisma } from '@/lib/prisma';
import { 
  Terminal,
  Activity,
  Command,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { JobTracker } from '@/components/JobTracker';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { cn } from '@/lib/utils';

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-red-500 font-mono text-xs uppercase tracking-widest">
         [FATAL_ERROR: UNAUTHORIZED_ACCESS]
      </div>
    );
  }

  const stats = {
    totalVideos: await prisma.video.count({ where: { userId: user.id } }),
    pendingJobs: await prisma.postJob.count({ 
      where: { 
        status: 'pending',
        schedule: { userId: user.id }
      } 
    }),
    postedReels: await prisma.postJob.count({ 
      where: { 
        status: 'success',
        schedule: { userId: user.id }
      } 
    }),
    failedJobs: await prisma.postJob.count({ 
      where: { 
        status: 'failed',
        schedule: { userId: user.id }
      } 
    }),
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-background font-mono text-foreground font-medium">
      <div className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-surface/50">
        <div className="flex items-center gap-4">
          <Terminal className="h-4 w-4 text-muted" />
          <span className="text-[10px] font-bold tracking-[0.2em]">NODE_DASHBOARD_V1.0.4</span>
        </div>
        <div className="flex items-center gap-4 text-[9px] text-muted font-bold tracking-widest tabular">
          <span>{new Date().toISOString()}</span>
        </div>
      </div>

      <main className="p-8 space-y-12 overflow-y-auto max-w-full">
        {/* Statistics Layer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DataNode label="ASSET_COUNT" value={stats.totalVideos} />
          <DataNode label="QUEUE_PENDING" value={stats.pendingJobs} />
          <DataNode label="EXEC_SUCCESS" value={stats.postedReels} />
          <DataNode label="EXEC_FAILED" value={stats.failedJobs} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Execution Log */}
          <section className="lg:col-span-3 space-y-6">
            <JobTracker userId={user.id} />
          </section>

          {/* Quick Commands */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-bold tracking-widest text-muted border-b border-white/5 pb-2 uppercase text-center md:text-left text-muted">CONTROL_CMDS</h2>
            <div className="grid grid-cols-1 gap-2">
              <CommandLink href="/upload" label="INGEST_ASSETS" />
              <CommandLink href="/schedule" label="INIT_DEPLOY" />
              <CommandLink href="/settings" label="SYNC_CREDENTIALS" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function DataNode({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-surface border border-white/5 p-4 rounded-none hover:border-white/20 transition-none">
      <div className="mb-4">
        <span className="text-[9px] font-bold tracking-[0.2em] text-muted">{label}</span>
      </div>
      <p className="text-3xl font-bold tabular tracking-tighter text-foreground">{value.toString().padStart(2, '0')}</p>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const colors = {
    pending: 'text-amber-500',
    processing: 'text-blue-500',
    success: 'text-emerald-500',
    failed: 'text-red-500',
  }[status] || 'text-muted';

  return (
    <span className={cn("text-[9px] font-bold tabular uppercase tracking-widest", colors)}>
      {status}
    </span>
  );
}

function CommandLink({ href, label }: { href: string, label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center p-3 bg-white/5 border border-white/5 hover:bg-white/10 text-foreground transition-none group"
    >
      <div className="flex-1">
        <p className="text-[10px] font-bold tracking-widest">{label}</p>
      </div>
      <ArrowRight className="h-3 w-3 text-muted group-hover:text-foreground" />
    </Link>
  );
}
