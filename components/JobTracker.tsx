'use client';

import { useState, useEffect } from 'react';
import { Terminal, Clock, CheckCircle2, XCircle, Loader2, Trash2, ExternalLink, Activity, FileVideo, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { formatDistanceToNow, intervalToDuration } from 'date-fns';

interface Job {
  id: string;
  scheduledAt: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  progress: number;
  log: string | null;
  facebookPostId: string | null;
  video: {
    id: string;
    filename: string;
  };
}

function Countdown({ target }: { target: Date }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now >= target) {
        setTimeLeft('QUEUED_FOR_EXECUTION');
        return;
      }

      const duration = intervalToDuration({ start: now, end: target });
      const parts = [];
      if (duration.days) parts.push(`${duration.days}d`);
      if (duration.hours) parts.push(`${duration.hours}h`);
      if (duration.minutes) parts.push(`${duration.minutes}m`);
      if (duration.seconds) parts.push(`${duration.seconds}s`);

      setTimeLeft(`EST_START: ${parts.join(' ')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{timeLeft}</span>;
}

export function JobTracker({ userId }: { userId: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`/api/jobs?userId=${userId}`);
      setJobs(response.data);
    } catch (e) {
      console.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      await axios.delete(`/api/jobs?jobId=${jobId}`);
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (e) {
      console.error('Failed to delete job');
    }
  };

  const retryJob = async (jobId: string) => {
    try {
      await axios.post('/api/jobs/retry', { jobId });
      fetchJobs(); // Refresh
    } catch (e) {
      console.error('Failed to retry job');
    }
  };

  const deployNow = async (jobId: string) => {
    try {
      await axios.post('/api/jobs/deploy-now', { jobId });
      fetchJobs(); // Refresh
    } catch (e) {
      console.error('Failed to deploy now');
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [userId]);

  if (loading && jobs.length === 0) {
    return (
      <div className="p-12 border border-white/5 bg-surface/30 flex items-center justify-center text-muted gap-3 font-mono text-xs uppercase tracking-widest">
         <Loader2 className="h-4 w-4 animate-spin" />
         Querying_Job_Database...
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono">
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-foreground animate-pulse" />
              <div className="space-y-0.5">
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-foreground">AUTOMATED_TASK_MONITOR</h3>
                  <p className="text-[8px] text-muted tracking-widest uppercase">NST: {new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kathmandu', timeStyle: 'medium', dateStyle: 'short' }).format(new Date())} [NEPALI_STANDARD_TIME]</p>
              </div>
          </div>
          <span className="text-[10px] text-muted tabular uppercase px-2 py-0.5 border border-white/10 bg-white/5">
              ACTIVE_PROCESSES: {jobs.filter(j => j.status === 'processing' || j.status === 'pending').length}
          </span>
      </div>

      {jobs.length === 0 ? (
        <div className="p-8 border border-white/5 text-center text-[10px] text-muted uppercase tracking-widest">
            NO_TASKS_SCHEDULED_IN_CURRENT_EPOCH
        </div>
      ) : (
        <div className="grid gap-2">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className={cn(
                "border p-4 transition-all group relative overflow-hidden",
                job.status === 'processing' ? "border-foreground bg-white/5" : "border-white/10 bg-surface/50 hover:bg-white/[0.02]"
              )}
            >
              {/* Background scanning effect for processing jobs */}
              {job.status === 'processing' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                     <div className="h-10 w-full bg-foreground/10 absolute -top-10 left-0 animate-[scan_2s_linear_infinite]" />
                </div>
              )}

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-start gap-5 flex-1 min-w-0">
                  {/* VIDEO THUMBNAIL */}
                  <div className="w-24 h-16 bg-background border border-white/10 shrink-0 relative overflow-hidden hidden sm:block">
                     <video 
                       src={`/api/videos/stream/${job.video.id}`} 
                       muted
                       playsInline
                       loop
                       preload="metadata"
                       className="absolute inset-0 w-full h-full object-cover opacity-60"
                     />
                     <div className="absolute inset-0 flex items-center justify-center text-white/20">
                        <PlayCircle className="h-4 w-4" />
                     </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-[11px] font-bold text-foreground uppercase tracking-tight truncate max-w-[200px]">
                            {job.video.filename}
                        </span>
                        <span className={cn(
                            "text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-widest",
                            job.status === 'pending' && "bg-white/5 text-muted",
                            job.status === 'processing' && "bg-foreground text-background",
                            job.status === 'success' && "bg-emerald-500/10 text-emerald-500",
                            job.status === 'failed' && "bg-red-500/10 text-red-500"
                        )}>
                            [{job.status}]
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[9px] text-muted/60 uppercase tracking-tighter tabular">
                        <div className="flex items-center gap-1.5 font-bold text-foreground/70">
                            <Clock className="h-3.5 w-3.5" />
                            {job.status === 'pending' ? (
                                <Countdown target={new Date(job.scheduledAt)} />
                            ) : (
                                <span>EXEC: {new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kathmandu', timeStyle: 'short', dateStyle: 'short' }).format(new Date(job.scheduledAt))}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 font-bold">
                            <Terminal className="h-3 w-3" />
                            ID: {job.id.substring(0, 8)}
                        </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                    {(job.status === 'pending' || job.status === 'failed') && (
                        <button 
                          onClick={() => deployNow(job.id)}
                          className="px-3 py-1.5 bg-foreground text-background text-[9px] font-bold uppercase tracking-widest hover:opacity-80 transition-none flex items-center gap-2"
                        >
                            <PlayCircle className="h-3 w-3" />
                            DEPLOY_NOW
                        </button>
                    )}
                    {job.status === 'failed' && (
                        <button 
                          onClick={() => retryJob(job.id)}
                          className="px-3 py-1.5 border border-white/20 text-muted text-[9px] font-bold uppercase tracking-widest hover:border-white/40 transition-none"
                        >
                            REQUEUE_TASK
                        </button>
                    )}
                    {job.facebookPostId && (
                        <a 
                          href={`https://facebook.com/${job.facebookPostId}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-muted hover:text-foreground transition-none border border-transparent hover:border-white/10 hover:bg-white/5"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}
                    <button 
                      onClick={() => deleteJob(job.id)}
                      className="p-2 text-muted hover:text-red-500 transition-none border border-transparent hover:border-red-500/10 hover:bg-red-500/5 group/del"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
              </div>

              {/* SERVER TO FACEBOOK PROGRESS */}
              {job.status === 'processing' && (
                <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-[8px] text-muted uppercase tracking-widest font-bold">
                        <span>META_SERVER_UPLINK_PROGRESS</span>
                        <span>{job.progress}%</span>
                    </div>
                    <div className="h-0.5 w-full bg-white/5 overflow-hidden">
                        <div 
                          className="h-full bg-foreground transition-all duration-500"
                          style={{ width: `${job.progress}%` }}
                        />
                    </div>
                </div>
              )}

              {job.log && job.status === 'failed' && (
                <div className="mt-4 p-3 bg-red-500/5 border border-red-500/10 font-mono text-[9px] text-red-400 leading-relaxed break-all">
                   <div className="flex items-center gap-2 mb-1 text-red-500/50 font-bold tracking-widest">
                       <XCircle className="h-2.5 w-2.5" /> ERROR_LOG_DUMP:
                   </div>
                   {job.log}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
