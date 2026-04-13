'use client';

import { useState, useEffect } from 'react';
import { Share2, Shield, Settings2, Terminal, ArrowRight, Loader2, Check } from 'lucide-react';
import { getConnectedPages, savePageSelection } from '@/app/actions/facebook';

export default function SettingsPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    setStatusMsg('');
    const result = await getConnectedPages();
    if (result.success) {
      setPages(result.data);
    } else {
      console.error('Fetch error:', result.error);
      if (result.error !== 'META_AUTH_REQUIRED') {
        setStatusMsg('ERR_FETCH: ' + result.error);
      }
    }
    setLoading(false);
  };

  const handleConnect = () => {
    window.location.href = '/api/facebook/login';
  };

  const handleSave = async () => {
    if (!selectedPageId) return;
    
    setSaving(true);
    const selectedPage = pages.find(p => p.id === selectedPageId);
    
    if (selectedPage) {
      const result = await savePageSelection(selectedPage.id, selectedPage.access_token);
      if (result.success) {
        setStatusMsg('CONFIGURATION_SAVED_SUCCESSFULLY');
      } else {
        setStatusMsg('ERROR: ' + result.error);
      }
    }
    setSaving(false);
    
    // Clear message after 3s
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-background font-mono text-foreground font-medium">
      <div className="h-16 flex items-center px-8 border-b border-white/5 bg-surface/50">
        <div className="flex items-center gap-4">
          <Terminal className="h-4 w-4 text-muted" />
          <h1 className="text-[10px] font-bold uppercase tracking-[0.2em]">NODE_CONFIGURATION_DAEMON</h1>
        </div>
      </div>

      <main className="p-8 max-w-2xl">
        <div className="space-y-4">
          {/* Integration Node */}
          <section className="bg-surface border border-white/10 p-6 space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-4">
                <Share2 className="text-primary-brand h-4 w-4" />
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">META_GRAPH_API_GATEWAY</h3>
                  <p className="text-[9px] text-muted tracking-widest uppercase mt-1">OAUTH_SECURE_TUNNEL</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="py-8 flex items-center justify-center border border-dashed border-white/10 text-muted">
                  <Loader2 className="h-4 w-4 animate-spin mr-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">INITIALIZING_TUNNEL...</span>
                </div>
              ) : pages.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-[10px] text-muted uppercase tracking-widest leading-relaxed">
                    No active tokens detected. Initialize secure OAuth tunnel to Meta to retrieve Long-Lived Page Access Tokens.
                  </p>
                  <button 
                    onClick={handleConnect}
                    className="flex items-center justify-center gap-3 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-bold py-4 rounded-none text-[10px] uppercase tracking-[0.3em] transition-none"
                  >
                    INIT_AUTH_FLOW <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-primary-brand/10 border border-primary-brand/20 p-4 flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary-brand" />
                    <span className="text-[10px] text-primary-brand font-bold uppercase tracking-widest">TUNNEL_CONNECTED</span>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-muted uppercase tracking-[0.3em] px-1 underline decoration-white/10 underline-offset-4">TARGET_NODE_SELECTION</label>
                    <div className="grid gap-2">
                       {pages.map(page => (
                         <div 
                           key={page.id}
                           onClick={() => setSelectedPageId(page.id)}
                           className={`p-3 border cursor-pointer flex items-center justify-between transition-none ${
                             selectedPageId === page.id 
                              ? 'border-primary-brand bg-white/5' 
                              : 'border-white/5 bg-background hover:bg-white/[0.02]'
                           }`}
                         >
                            <span className={`text-[10px] font-bold ${selectedPageId === page.id ? 'text-primary-brand' : 'text-foreground/80'}`}>
                              {page.name}
                            </span>
                            <span className="text-[9px] tabular text-muted uppercase tracking-tighter">
                              REF_{page.id}
                            </span>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Action Buffer */}
          <section className="bg-surface border border-white/10 p-6 space-y-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <Shield className="text-muted h-4 w-4" />
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">PERSISTENCE_CONTROLS</h3>
              </div>
            </div>
            
            {statusMsg && (
              <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 mb-2">
                [{statusMsg}]
              </div>
            )}
            
            <button 
              onClick={handleSave}
              disabled={!selectedPageId || saving}
              className="flex items-center justify-center gap-3 w-full bg-primary-brand text-background font-bold py-3.5 rounded-none text-[10px] uppercase tracking-[0.4em] transition-none shadow-sm disabled:opacity-20"
            >
              <Settings2 className="h-3.5 w-3.5" /> 
              {saving ? 'UPDATING_NODE...' : 'COMMIT_CONFIG'}
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
