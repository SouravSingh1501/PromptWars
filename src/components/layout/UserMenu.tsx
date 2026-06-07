'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/components/layout/AuthProvider';
import { signInWithGoogle, signOut } from '@/lib/firebase';
import Button from '@/components/ui/Button';

export default function UserMenu() {
  const { user, isAuthenticated } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <Button variant="secondary" size="sm" onClick={() => signInWithGoogle()}>
        Sign In
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full glass border-white/10 hover:bg-white/5 transition-all"
      >
        <img
          src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Musafir'}
          alt="User"
          className="w-8 h-8 rounded-full border border-neon-cyan/30"
        />
        <div className="hidden sm:block text-left pr-2">
          <p className="text-[10px] font-bold text-white truncate max-w-[80px]">
            {user?.displayName?.split(' ')[0]}
          </p>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-neon-green animate-pulse" />
            <span className="text-[8px] text-obsidian-500 uppercase tracking-tighter">Online</span>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-2 w-48 glass p-2 z-50 border border-white/10"
            >
              <div className="px-3 py-2 border-b border-white/5 mb-2">
                <p className="text-xs font-bold truncate">{user?.email}</p>
                <p className="text-[10px] text-obsidian-500">Explorer Level 1</p>
              </div>
              <button className="w-full text-left px-3 py-2 text-xs text-obsidian-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                My Trips
              </button>
              <button className="w-full text-left px-3 py-2 text-xs text-obsidian-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                Preferences
              </button>
              <button
                onClick={() => signOut()}
                className="w-full text-left px-3 py-2 text-xs text-neon-red hover:bg-neon-red/10 rounded-lg transition-all mt-1"
              >
                Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
