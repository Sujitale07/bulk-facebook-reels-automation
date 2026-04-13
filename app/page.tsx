import Link from 'next/link';
import { Clapperboard, CheckCircle2, Zap, Shield, ArrowRight, Terminal } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-mono font-medium">
      {/* System Header */}
      <header className="px-6 lg:px-12 h-16 flex items-center border-b border-white/5 bg-surface sticky top-0 z-50">
        <Link className="flex items-center gap-4" href="/">
          <Clapperboard className="h-4 w-4 text-primary-brand" />
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase">AUTOMATE_OS</span>
        </Link>
        <nav className="ml-auto flex gap-10">
          <Link className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted hover:text-foreground transition-none" href="/dashboard">
            CONNECT_NODE
          </Link>
          <Link className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted hover:text-foreground transition-none" href="/upload">
            ASSET_INGEST
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Functional Distribution Unit */}
        <section className="py-40 px-6 lg:px-12 max-w-5xl mx-auto border-x border-white/5 min-h-[80vh] flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-10 text-muted">
            <Terminal className="h-3.5 w-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em]">VERSION::1.0.4.STABLE</span>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-bold tracking-tighter mb-10 leading-[0.8] uppercase">
            REELS_AUTO <br /> 
            <span className="text-muted">DEPLOY_ENGINE.</span>
          </h1>
          
          <p className="text-[11px] text-muted mb-16 max-w-lg leading-relaxed uppercase tracking-widest font-bold">
            DISTRIBUTION PROTOCOL FOR HIGH-VOLUME REELS PUBLISHING. 
            OFFICIAL META GRAPH GATEWAY INTEGRATION. 
            STATE-PERSISTENT QUEUE ARCHITECTURE.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/dashboard" 
              className="bg-primary-brand text-background font-bold py-4 px-12 transition-none text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3"
            >
              INIT_SESSION <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              href="/upload" 
              className="bg-transparent border border-white/10 hover:bg-white/5 text-foreground font-bold py-4 px-12 transition-none text-[10px] uppercase tracking-[0.4em] flex items-center justify-center"
            >
              INGEST_INDEX
            </Link>
          </div>
        </section>

        {/* Node Capabilities */}
        <section className="py-32 border-y border-white/5 bg-surface/30">
          <div className="px-6 lg:px-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
            <CapabilityItem 
              id="01"
              title="STATE_RELIABILITY" 
              description="PERSISTENT BACKGROUND EXECUTION WITH AUTOMATED SYNC RETRIES."
            />
            <CapabilityItem 
              id="02"
              title="DENSITY_CONTROLS" 
              description="TEMPORAL DISTRIBUTION ALGORITHMS FOR MULTI-ASSET DEPLOYMENT."
            />
            <CapabilityItem 
              id="03"
              title="SECURE_TUNNEL" 
              description="ENCRYPTED CREDENTIAL STORAGE FOR AUTHENTICATED GRAPH ACCESS."
            />
          </div>
        </section>
      </main>

      {/* Terminal Footer */}
      <footer className="py-16 px-6 lg:px-12 border-t border-white/5 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted">
          SYSTEM_AUTO_INDUSTRIAL // PROTOCOL_LEVEL_2026
        </p>
      </footer>
    </div>
  );
}

function CapabilityItem({ id, title, description }: { id: string, title: string, description: string }) {
  return (
    <div className="space-y-6">
      <div className="text-[9px] font-bold text-primary-brand tabular tracking-widest">NODE_TYPE_[{id}]</div>
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-white/5 pb-2">{title}</h3>
      <p className="text-[10px] text-muted leading-relaxed font-bold tracking-widest">{description}</p>
    </div>
  );
}
