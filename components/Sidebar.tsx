'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { 
  Upload, 
  Settings, 
  LayoutDashboard, 
  History, 
  Calendar,
  Clapperboard,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'DASHBOARD', href: '/dashboard' },
  { icon: Upload, label: 'INGESTION', href: '/upload' },
  { icon: Calendar, label: 'DEPLOYMENT', href: '/schedule' },
  { icon: History, label: 'SYSTEM LOGS', href: '/status' },
  { icon: Settings, label: 'CONFIGURATION', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname === '/';

  if (isAuthPage) return null;

  const initials = user?.emailAddresses[0]?.emailAddress?.slice(0, 2).toUpperCase() || '??';
  const nodeName = user?.emailAddresses[0]?.emailAddress?.split('@')[0].toUpperCase() || 'UNKNOWN_NODE';

  return (
    <aside className="w-[248px] bg-surface border-r border-primary-brand/10 flex flex-col h-screen shrink-0 font-mono">
      <div className="h-16 flex items-center px-6 border-b border-primary-brand/10 bg-background/50">
        <Link href="/" className="flex items-center gap-3">
          <Clapperboard className="h-4 w-4 text-primary-brand" aria-hidden="true" />
          <span className="font-bold text-xs tracking-[0.2em]">AUTOMATE</span>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-[10px] font-bold tracking-widest rounded-sm transition-none",
                isActive 
                  ? "bg-primary-brand text-background" 
                  : "text-muted hover:bg-white/5 hover:text-foreground"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-brand/10 bg-background/30">
        <div className="flex items-center gap-4 px-3 py-3 border border-primary-brand/10 rounded-sm">
          <div className="h-8 w-8 bg-white/5 border border-primary-brand/10 rounded-sm flex items-center justify-center text-[10px] font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold truncate tracking-tight uppercase">{nodeName}</p>
            <p className="text-[9px] text-muted truncate tabular uppercase">ACTIVE_SESSION</p>
          </div>
          <button 
            onClick={() => signOut({ redirectUrl: '/login' })}
            className="text-muted hover:text-white transition-colors"
            title="TERMINATE_SESSION"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
