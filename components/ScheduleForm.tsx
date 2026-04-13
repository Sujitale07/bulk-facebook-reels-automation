'use client';

import { useState } from 'react';
import { Terminal, Database, Play, Check, ChevronRight } from 'lucide-react';
import { submitSchedule } from '@/app/actions/scheduler';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Video {
  id: string;
  filename: string;
}

export function ScheduleForm({ videos, userId }: { videos: Video[], userId: string }) {
  const router = useRouter();
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [videosPerDay, setVideosPerDay] = useState(3);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleVideo = (id: string) => {
    setSelectedVideos(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVideos.length === 0) return;

    setIsSubmitting(true);
    const result = await submitSchedule({
      userId,
      videoIds: selectedVideos,
      videosPerDay,
      startDate,
      timeSlots: ["09:00", "15:00", "21:00"]
    });

    if (result.success) {
      router.push('/dashboard');
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8 font-mono text-foreground font-medium">
      {/* Video Selection */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-surface border border-white/10 p-6">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-muted" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">ASSET_SELECTION_POOL</h3>
            </div>
            <div className="text-[9px] font-bold text-muted tabular uppercase tracking-widest">SELECTED_NODES: {selectedVideos.length.toString().padStart(2, '0')}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {videos.map((video) => {
              const checked = selectedVideos.includes(video.id);
              return (
                <div 
                  key={video.id}
                  onClick={() => toggleVideo(video.id)}
                  className={cn(
                    "group p-3 border cursor-pointer transition-none flex items-center justify-between",
                    checked
                      ? "border-primary-brand bg-white/5"
                      : "border-white/5 bg-background hover:bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={cn(
                      "text-[9px] font-bold tabular tracking-widest uppercase",
                      checked ? "text-primary-brand" : "text-muted"
                    )}>
                      {checked ? "[X]" : "[ ]"}
                    </span>
                    <span className={cn(
                      "text-[10px] truncate font-bold lowercase",
                      checked ? "text-primary-brand" : "text-foreground/80"
                    )}>
                      {video.filename}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {videos.length === 0 && (
              <div className="col-span-2 py-24 text-center border border-white/5 bg-background">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Null: No assets indexed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Unit */}
      <div className="space-y-6">
        <div className="bg-surface border border-white/10 p-6 sticky top-8">
          <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
            <Terminal className="h-4 w-4 text-muted" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">DEPLOY_PARAM</h3>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-[9px] font-bold text-muted uppercase tracking-widest underline decoration-white/20 underline-offset-4">DENSITY_RATIO</label>
                <span className="text-[10px] font-bold tabular">{videosPerDay.toString().padStart(2, '0')}</span>
              </div>
              <input 
                type="range" min="1" max="10" 
                value={videosPerDay} 
                onChange={(e) => setVideosPerDay(Number(e.target.value))}
                className="w-full transition-none accent-primary-brand h-1.5 bg-background rounded-none appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[9px] font-bold text-muted uppercase tracking-widest underline decoration-white/20 underline-offset-4">COMMENCE_TS</label>
                <div className="flex justify-between items-center bg-white/5 border-l border-foreground px-3 py-1">
                   <span className="text-[8px] text-muted uppercase">SYSTEM_TIMEZONE</span>
                   <span className="text-[10px] text-foreground font-bold tabular animate-pulse">NST [GMT+5:45]</span>
                </div>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-background border border-white/10 text-[10px] p-3 text-foreground focus:border-primary-brand outline-none transition-none uppercase"
                />
            </div>

            <div className="pt-8 border-t border-white/5 space-y-4">
               <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-muted">
                 <span>BATCH_SIZE</span>
                 <span className="tabular text-foreground">{selectedVideos.length.toString().padStart(2, '0')}</span>
               </div>
               <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-muted">
                 <span>EXEC_EST_DAYS</span>
                 <span className="tabular text-foreground">
                   {(selectedVideos.length > 0 ? Math.ceil(selectedVideos.length / videosPerDay) : 0).toString().padStart(2, '0')}
                 </span>
               </div>
               
               <button 
                 type="submit"
                 disabled={selectedVideos.length === 0 || isSubmitting}
                 className="w-full bg-primary-brand text-background font-bold py-4 mt-8 text-[10px] uppercase tracking-[0.3em] transition-none disabled:opacity-20 flex items-center justify-center gap-3"
               >
                 {isSubmitting ? 'GENERATING...' : (
                   <>
                     INIT_DEPLOY <ChevronRight className="h-4 w-4" />
                   </>
                 )}
               </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
