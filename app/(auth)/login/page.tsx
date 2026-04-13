import React from 'react';
import { SignIn } from '@clerk/nextjs';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-[#e0e0e0] font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding header remains to maintain the look */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-[#1a1a1a] mb-6 bg-[#0a0a0a]">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl tracking-[0.2em] font-bold text-white uppercase mb-2">System Access</h1>
          <p className="text-[#666] text-[10px] tracking-widest uppercase">Establishing Secure Protocol Channel</p>
        </div>

        <div className="clerk-container">
          <SignIn 
            path="/login"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-black border border-[#1a1a1a] shadow-none rounded-none w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-[#0a0a0a] border border-[#333] hover:bg-[#111] transition-colors rounded-none text-white font-mono uppercase text-[10px] tracking-widest",
                socialButtonsBlockButtonText: "text-white font-bold",
                dividerLine: "bg-[#1a1a1a]",
                dividerText: "text-[#444] uppercase text-[10px] tracking-widest font-mono",
                formFieldLabel: "text-[10px] text-[#666] uppercase tracking-widest font-mono mb-1",
                formFieldInput: "bg-[#0a0a0a] border border-[#1a1a1a] rounded-none text-white focus:border-white transition-colors font-mono",
                formButtonPrimary: "bg-white text-black rounded-none hover:bg-[#ccc] transition-colors uppercase font-bold tracking-[0.2em] text-[11px] py-4",
                footerActionText: "text-[#444] font-mono text-[10px] uppercase tracking-widest",
                footerActionLink: "text-white hover:text-[#ccc] transition-colors font-mono font-bold uppercase",
                identityPreviewText: "text-white font-mono",
                identityPreviewEditButton: "text-[#666] hover:text-white transition-colors",
              }
            }}
          />
        </div>

        <div className="mt-8 pt-8 border-t border-[#1a1a1a] flex justify-center items-center text-[10px] text-[#222] tracking-[0.3em] uppercase">
          SECURE_NODE_AUTH_v7.0
        </div>
      </div>
    </div>
  );
}
