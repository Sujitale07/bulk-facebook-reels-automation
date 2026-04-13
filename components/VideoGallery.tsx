'use client';

import { useState, useEffect } from 'react';
import { Play, Trash2, Loader2, FileVideo, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { formatBytes } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Video {
  id: string;
  filename: string;
  size: number;
  status: string;
  createdAt: string;
  postJobs: any[];
}

export function VideoGallery({ userId }: { userId: string }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`/api/videos?userId=${userId}`);
      setVideos(response.data);
    } catch (e) {
      console.error('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [userId]);

  const deleteVideo = async (videoId: string) => {
    const confirmed = window.confirm('REMAINING_TASK_DEPENDENCIES_MAY_FAIL. CONFIRM_ASSET_DELETION?');
    if (!confirmed) return;

    try {
      await axios.delete(`/api/videos?videoId=${videoId}`);
      setVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (e) {
      alert('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20 text-muted font-mono text-[10px] tracking-widest uppercase">
         <Loader2 className="h-4 w-4 animate-spin mr-3" /> INITIALIZING_LIBRARY_VIEW...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
       <div className="flex items-center gap-4 border-b border-white/10 pb-4">
            <FileVideo className="h-5 w-5 text-foreground" />
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-foreground">ASSET_LIBRARY</h3>
            <span className="text-[10px] text-muted border border-white/10 px-2 py-0.5 tabular ml-auto">
                TOTAL: {videos.length}
            </span>
       </div>

       {videos.length === 0 ? (
         <div className="p-20 border border-white/5 bg-surface/20 text-center text-muted text-[10px] uppercase tracking-widest">
            NO_ASSETS_FOUND_IN_WORKSPACE
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5 border border-white/10 bg-white/10">
           {videos.map((video) => (
             <div key={video.id} className="bg-background p-4 flex flex-col gap-4 group hover:bg-white/[0.02] transition-none group/card">
                <div className="aspect-video bg-surface border border-white/5 relative overflow-hidden">
                    <video 
                      src={`/api/videos/stream/${video.id}`} 
                      muted
                      playsInline
                      loop
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover/card:opacity-60 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-white/5 pointer-events-none">
                        <FileVideo className="h-12 w-12" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/40">
                         <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-foreground truncate uppercase">{video.filename}</p>
                    <div className="flex flex-col gap-1 text-[8px] text-muted/60 tabular uppercase tracking-tighter font-bold">
                        <div className="flex justify-between">
                            <span>SIZE</span>
                            <span>{formatBytes(video.size)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>UPLOADED_ON</span>
                            <span>{new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kathmandu', timeStyle: 'short', dateStyle: 'short' }).format(new Date(video.createdAt))}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                        <span className={cn(
                            "text-[8px] font-bold px-1.5 py-0.5 border uppercase",
                            video.postJobs.some(j => j.status === 'success') ? "text-emerald-500 border-emerald-500/20" : "text-muted border-white/10"
                        )}>
                            {video.postJobs.some(j => j.status === 'success') ? "POSTED" : "UNPUBLISHED"}
                        </span>
                        <div className="ml-auto flex gap-1">
                            <button 
                              onClick={() => deleteVideo(video.id)}
                              className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/5 transition-none opacity-0 group-hover/card:opacity-100"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
             </div>
           ))}
         </div>
       )}
    </div>
  );
}
