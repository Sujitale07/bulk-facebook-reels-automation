'use client';

import { useState, useRef, useEffect } from 'react';
import { Terminal, X, Check, Loader2, Play, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { cn, formatBytes } from '@/lib/utils';

interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
}

export function UploadForm({ userId }: { userId: string }) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file), // Generate local preview
        status: 'pending' as const,
        progress: 0
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [files]);

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const uploadSingleFile = async (index: number) => {
    const fileObj = files[index];
    if (fileObj.status === 'success') return;

    setFiles(prev => {
      const next = [...prev];
      next[index].status = 'uploading';
      return next;
    });

    const formData = new FormData();
    formData.append('file', fileObj.file);
    formData.append('userId', userId);

    try {
      const response = await axios.post('/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total) 
            : 0;
          
          setFiles(prev => {
            const next = [...prev];
            if (next[index]) next[index].progress = progress;
            return next;
          });
        }
      });

      if (response.data.success) {
        setFiles(prev => {
          const next = [...prev];
          if (next[index]) next[index].status = 'success';
          return next;
        });
      }
    } catch (error) {
      setFiles(prev => {
        const next = [...prev];
        if (next[index]) next[index].status = 'error';
        return next;
      });
    }
  };

  const startBatchUpload = async () => {
    for (let i = 0; i < files.length; i++) {
        if (files[i].status === 'pending' || files[i].status === 'error') {
            await uploadSingleFile(i);
        }
    }
  };

  return (
    <div className="space-y-8 font-mono text-foreground font-medium bg-background p-1 select-none">
      {/* DRAG & DROP ZONE */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-white/10 p-16 text-center cursor-pointer hover:border-white/30 hover:bg-white/[0.02] transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5 pointer-events-none">
           <div className="grid grid-cols-12 h-full w-full">
              {Array.from({length: 12}).map((_, i) => (
                <div key={i} className="border-r border-white/10 h-full" />
              ))}
           </div>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          hidden 
          multiple 
          accept="video/*" 
          onChange={onFileChange}
        />
        <Terminal className="mx-auto h-6 w-6 text-muted mb-6 group-hover:text-foreground group-hover:scale-110 transition-transform" />
        <h3 className="text-xs font-bold uppercase tracking-[0.4em] mb-3 text-foreground">ASSET_INGESTION_MODULE_V2</h3>
        <p className="text-[10px] text-muted tracking-widest uppercase max-w-xs mx-auto leading-relaxed">
          Drop digital artifacts here for automated library indexing.
        </p>
      </div>

      {files.length > 0 && (
        <div className="border border-white/10 bg-surface/30">
          <div className="flex justify-between items-center bg-white/5 border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">INGEST_STAGING_BUFFER</h4>
                <span className="text-[10px] text-muted border border-white/10 px-2 py-0.5 tabular">QTY:{files.length}</span>
            </div>
            <div className="flex gap-2">
                <button 
                  onClick={() => setFiles([])}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-red-500 transition-none"
                >
                  CLEAR_BUFFER
                </button>
                <button 
                  onClick={startBatchUpload}
                  disabled={files.every(f => f.status === 'success' || f.status === 'uploading')}
                  className="bg-foreground text-background px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-none disabled:opacity-20 flex items-center gap-2"
                >
                  {files.some(f => f.status === 'uploading') ? <Loader2 className="h-3 w-3 animate-spin"/> : null}
                  EXECUTE_INGESTION
                </button>
            </div>
          </div>
          
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {files.map((f, i) => (
              <div key={f.id} className="p-4 group/item hover:bg-white/[0.01] transition-none">
                <div className="flex items-start gap-6">
                  {/* VIDEO PREVIEW */}
                  <div className="relative h-20 w-32 bg-background border border-white/10 overflow-hidden flex-shrink-0">
                     <video 
                       src={f.preview} 
                       className="h-full w-full object-cover opacity-60 group-hover/item:opacity-100 transition-opacity" 
                     />
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity bg-black/40">
                        <Play className="h-4 w-4 fill-white text-white"/>
                     </div>
                  </div>

                  {/* FILE INFO & PROGRESS */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold truncate text-foreground/90 uppercase mb-1">{f.file.name}</p>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-muted tabular uppercase">{formatBytes(f.file.size)}</span>
                                <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 border",
                                    f.status === 'pending' && "text-muted border-white/10",
                                    f.status === 'uploading' && "text-foreground border-foreground animate-pulse",
                                    f.status === 'success' && "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
                                    f.status === 'error' && "text-red-500 border-red-500/30 bg-red-500/5"
                                )}>
                                    {f.status}
                                </span>
                            </div>
                        </div>
                        <button 
                          onClick={() => removeFile(f.id)} 
                          className="text-muted hover:text-red-500 p-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* PROGRESS BAR */}
                    {(f.status === 'uploading' || f.status === 'success' || f.status === 'error') && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] text-muted tabular uppercase tracking-tighter">
                                <span>SYNC_PROGRESS</span>
                                <span>{f.progress}%</span>
                            </div>
                            <div className="h-1 bg-white/5 border border-white/5 flex">
                                <div 
                                    className={cn(
                                        "h-full transition-all duration-300",
                                        f.status === 'error' ? "bg-red-500" : "bg-foreground"
                                    )}
                                    style={{ width: `${f.progress}%` }}
                                />
                            </div>
                            <div className="text-[8px] text-muted/60 flex gap-2 tabular overflow-hidden whitespace-nowrap">
                                {Array.from({length: 40}).map((_, i) => (
                                    <span key={i} className={cn(i < (f.progress/2.5) ? "text-foreground" : "text-white/5")}>█</span>
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-black/40 border-t border-white/10 flex items-center gap-4 text-[9px] text-muted/60 tracking-widest uppercase">
             <AlertCircle className="h-3 w-3" />
             NOTICE: ASSETS ARE PERMANENTLY INDEXED ONCE INGESTION EXECUTES SUCCESSFULLY.
          </div>
        </div>
      )}
    </div>
  );
}
