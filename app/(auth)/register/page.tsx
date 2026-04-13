'use client';

import React from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Terminal, Shield, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { signUp } = useSignUp();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    
    setIsLoading(true);
    setError('');

    try {
      const { error: signUpError } = await signUp.create({
        emailAddress: email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      const { error: codeError } = await signUp.verifications.sendEmailCode();
      
      if (codeError) {
        setError(codeError.message);
        setIsLoading(false);
        return;
      }

      setPendingVerification(true);
      setIsLoading(false);
    } catch (err: any) {
      setError('REGISTRATION_INTERNAL_ERROR');
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    setIsLoading(true);
    setError('');

    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (verifyError) {
        setError(verifyError.message);
        setIsLoading(false);
        return;
      }

      if (signUp.status === 'complete') {
        await signUp.finalize();
        router.push('/dashboard');
      } else {
        setError(`VERIFICATION_STATUS_INCOMPLETE: ${signUp.status.toUpperCase()}`);
        setIsLoading(false);
      }
    } catch (err: any) {
      setError('VERIFICATION_FAILURE');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#e0e0e0] font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-[#333] mb-6 bg-[#0a0a0a]">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl tracking-[0.2em] font-bold text-white uppercase mb-2">Node Enrollment</h1>
          <p className="text-[#666] text-[10px] uppercase tracking-widest">
            {pendingVerification ? 'Verifying Identity Vector' : 'Registering New Access Node'}
          </p>
        </div>

        {!pendingVerification ? (
          <form onSubmit={handleRegister} className="space-y-6">
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
                className="w-full bg-[#0a0a0a] border border-[#333] p-3 text-sm focus:outline-none focus:border-white transition-colors"
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
                className="w-full bg-[#0a0a0a] border border-[#333] p-3 text-sm focus:outline-none focus:border-white transition-colors"
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
                  Register Node <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            {error && (
              <div className="bg-red-950/20 border border-red-900/50 p-3 text-red-500 text-xs flex items-center">
                <span className="mr-2">ERR:</span> {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] text-[#666] uppercase tracking-widest">Verification Fragment (Code)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] p-3 text-sm focus:outline-none focus:border-white transition-colors text-center tracking-[1em]"
                placeholder="••••••"
                maxLength={6}
                required
              />
              <p className="text-[9px] text-[#444] text-center pt-2 italic">CODE SENT TO {email.toUpperCase()}</p>
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
                  Confirm Vector <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-8 border-t border-[#1a1a1a] flex justify-between items-center text-[10px] text-[#444] tracking-widest">
          <Link href="/login" className="hover:text-white transition-colors uppercase">
            Existing Access
          </Link>
          <span className="flex items-center">
            <Terminal className="w-3 h-3 mr-2" /> 
            NODE_REG_v7.0
          </span>
        </div>
      </div>
    </div>
  );
}
