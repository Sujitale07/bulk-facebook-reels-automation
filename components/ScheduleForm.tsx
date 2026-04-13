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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = videos.filter(v => 
    v.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleVideo = (id: string) => {
    setSelectedVideos(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedVideos(filteredVideos.map(v => v.id));
  };

  const selectNone = () => {
    setSelectedVideos([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVideos.length === 0) return;

    const confirmed = window.confirm(`CONFIRM_ORCHESTRATION_DEPLOYMENT?\nUNITS: ${selectedVideos.length}\nFREQ: ${videosPerDay} posts/day\nSTART: ${startDate}`);
    if (!confirmed) return;

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-primary-brand" />
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">ASSET_SELECTION_POOL</h3>
                <p className="text-[8px] text-muted tracking-widest uppercase mt-1">TOTAL_RESOURCES: {videos.length.toString().padStart(3, '0')}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
               <div className="relative">
                 <input 
                   type="text" 
                   placeholder="SEARCH_BY_ID_OR_NAME..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="bg-background border border-white/10 text-[9px] py-2 px-3 w-48 focus:border-primary-brand transition-none outline-none placeholder:text-muted uppercase"
                 />
               </div>
               <div className="flex gap-2">
                 <button type="button" onClick={selectAll} className="text-[9px] font-bold text-muted hover:text-white transition-none border border-white/5 px-2 py-1.5 uppercase tracking-tighter">Select_All</button>
                 <button type="button" onClick={selectNone} className="text-[9px] font-bold text-muted hover:text-white transition-none border border-white/5 px-2 py-1.5 uppercase tracking-tighter">Clear</button>
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredVideos.map((video) => {
              const checked = selectedVideos.includes(video.id);
              return (
                <div 
                  key={video.id}
                  onClick={() => toggleVideo(video.id)}
                  className={cn(
                    "group p-4 border cursor-pointer transition-none relative flex flex-col gap-3",
                    checked
                      ? "border-primary-brand/50 bg-primary-brand/[0.03]"
                      : "border-white/5 bg-background hover:bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        checked ? "bg-primary-brand animate-pulse" : "bg-white/10"
                      )} />
                      <span className={cn(
                        "text-[9px] font-bold tabular tracking-widest uppercase",
                        checked ? "text-primary-brand" : "text-muted"
                      )}>
                        ID_{video.id.slice(-6)}
                      </span>
                    </div>
                    {checked && <Check className="h-3 w-3 text-primary-brand" />}
                  </div>

                  <div className="space-y-1">
                    <p className={cn(
                      "text-[10px] font-bold truncate leading-tight",
                      checked ? "text-foreground" : "text-foreground/60"
                    )}>
                      {video.filename}
                    </p>
                    <p className="text-[8px] text-muted tracking-widest uppercase italic">Type: Video/MP4</p>
                  </div>

                  <div className="pt-2 mt-auto border-t border-white/5 flex items-center justify-between">
                     <span className="text-[8px] text-muted font-bold tracking-widest uppercase">Status: Indexed</span>
                     <span className={cn(
                       "text-[8px] font-bold uppercase py-0.5 px-1.5",
                       checked ? "bg-primary-brand text-background" : "bg-white/5 text-muted"
                     )}>
                       {checked ? "READY" : "WAITING"}
                     </span>
                  </div>
                </div>
              );
            })}
            
            {filteredVideos.length === 0 && (
              <div className="col-span-full py-24 text-center border border-dashed border-white/10 bg-background/50">
                <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-muted">SEARCH_QUERY_RETURNED_NULL</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Unit */}
      <div className="space-y-6">
        <div className="bg-surface border border-white/10 p-6 sticky top-8">
          <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
            <Terminal className="h-4 w-4 text-primary-brand" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">EXEC_POLICY</h3>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[9px] font-bold text-muted uppercase tracking-widest underline decoration-white/20 underline-offset-4">DENSITY_FREQ</label>
                <div className="text-right">
                  <span className="text-[14px] font-bold tabular leading-none">{videosPerDay}</span>
                  <span className="text-[8px] text-muted uppercase block">PTS/PER_24H</span>
                </div>
              </div>
              <input 
                type="range" min="1" max="10" 
                value={videosPerDay} 
                onChange={(e) => setVideosPerDay(Number(e.target.value))}
                className="w-full transition-none accent-primary-brand h-1.5 bg-background rounded-none appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[9px] font-bold text-muted uppercase tracking-widest underline decoration-white/20 underline-offset-4">LAUNCH_WINDOW</label>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/5 border-l-2 border-primary-brand px-3 py-1.5">
                   <span className="text-[8px] text-muted uppercase font-bold tracking-tighter">REGION_SPEC</span>
                   <span className="text-[10px] text-primary-brand font-bold tabular">NEPAL [NST]</span>
                </div>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-background border border-white/10 text-[10px] p-3 text-foreground focus:border-primary-brand outline-none transition-none uppercase font-bold"
                />
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
               <div className="space-y-3">
                 <p className="text-[8px] font-bold uppercase text-muted tracking-widest">PROJECTION_SUMMARY</p>
                 <div className="grid grid-cols-2 gap-2">
                    <div className="bg-background border border-white/5 p-3">
                      <span className="block text-[8px] text-muted uppercase mb-1">UNITS</span>
                      <span className="block text-[12px] font-bold tabular text-primary-brand">{selectedVideos.length.toString().padStart(2, '0')}</span>
                    </div>
                    <div className="bg-background border border-white/5 p-3">
                      <span className="block text-[8px] text-muted uppercase mb-1">CYCLE</span>
                      <span className="block text-[12px] font-bold tabular text-primary-brand">
                        {(selectedVideos.length > 0 ? Math.ceil(selectedVideos.length / videosPerDay) : 0).toString().padStart(2, '0')}d
                      </span>
                    </div>
                 </div>
               </div>
               
               <button 
                 type="submit"
                 disabled={selectedVideos.length === 0 || isSubmitting}
                 className="relative group w-full bg-primary-brand text-background font-black py-5 overflow-hidden text-[10px] uppercase tracking-[0.4em] transition-none disabled:opacity-20 flex items-center justify-center gap-3"
               >
                 <span className="relative z-10 flex items-center gap-3">
                   {isSubmitting ? (
                     <>
                        <Play className="h-3 w-3 animate-ping" /> CALCULATING_VECTORS...
                     </>
                   ) : (
                     <>
                       COMMIT_ORCHESTRATION <ChevronRight className="h-4 w-4" />
                     </>
                   )}
                 </span>
                 <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
