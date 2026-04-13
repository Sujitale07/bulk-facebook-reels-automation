'use client';

import React from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Terminal, Shield, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { signIn } = useSignIn();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    
    setIsLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn.create({
        identifier: email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      if (signIn.status === 'complete') {
        await signIn.finalize();
        router.push('/dashboard');
      } else {
        setError(`UNEXPECTED STATUS: ${signIn.status.toUpperCase()}`);
        setIsLoading(false);
      }
    } catch (err: any) {
      setError('PROTOCOL ERROR: AUTHENTICATION_FAILED');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#e0e0e0] font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Monochromatic Logo/Branding */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-[#333] mb-6 bg-[#0a0a0a]">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl tracking-[0.2em] font-bold text-white uppercase mb-2">System Access</h1>
          <p className="text-[#666] text-xs">ESTABLISHING SECURE PROTOCOL CHANNEL</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-950/20 border border-red-900/50 p-3 text-red-500 text-xs flex items-center">
              <span className="mr-2">ERR:</span> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] text-[#666] uppercase tracking-widest">Identifier (Email)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] p-3 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-[#333]"
              placeholder="operator@system.node"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-[#666] uppercase tracking-widest">Access Key (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] p-3 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-[#333]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#ccc] transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Initialize Session <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-[#1a1a1a] flex justify-between items-center text-[10px] text-[#444] tracking-widest">
          <Link href="/register" className="hover:text-white transition-colors uppercase">
            Request Access
          </Link>
          <span className="flex items-center">
            <Terminal className="w-3 h-3 mr-2" /> 
            NODE_AUTH_v7.0
          </span>
        </div>
      </div>
    </div>
  );
}
