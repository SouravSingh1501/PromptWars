'use client';
import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';

export default function SetupGuard({ children }: { children: React.ReactNode }) {
  const isConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                       process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your_firebase_api_key';

  // Bypass guard in production as keys are managed via Cloud Run environment variables
  if (isConfigured || process.env.NODE_ENV === 'production') return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[10000] bg-obsidian-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 ambient-bg opacity-50" />
      
      <GlassCard variant="neon-purple" className="max-w-md w-full text-center relative z-10" hover={false}>
        <div className="text-4xl mb-4">⚙️</div>
        <h2 className="text-2xl font-bold mb-2">NomadIQ Setup Required</h2>
        <p className="text-sm text-obsidian-400 mb-6 leading-relaxed">
          It looks like your <code className="text-neon-cyan">.env.local</code> file is missing or contains placeholder keys. 
          Nomad needs these to connect to its AI brain and real-time database.
        </p>

        <div className="space-y-3 text-left mb-8">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-obsidian-500 font-bold mb-1">Step 1</p>
            <p className="text-xs">Create a file named <code className="text-neon-purple">.env.local</code> in your root directory.</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-obsidian-500 font-bold mb-1">Step 2</p>
            <p className="text-xs">Copy the keys from <code className="text-neon-cyan">.env.local.example</code>.</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-obsidian-500 font-bold mb-1">Step 3</p>
            <p className="text-xs">Restart your development server (<code className="text-neon-green">npm run dev</code>).</p>
          </div>
        </div>

        <Badge variant="amber" pulse>Missing API Keys</Badge>
      </GlassCard>
    </div>
  );
}
