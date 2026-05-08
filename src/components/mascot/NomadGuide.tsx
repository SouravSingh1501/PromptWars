'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MascotState } from '@/lib/types';

interface NomadGuideProps {
  state: MascotState;
  message: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const stateConfig: Record<MascotState, { gradient: string; shadow: string; icon: string; speed: number }> = {
  idle: {
    gradient: 'from-neon-cyan via-neon-green to-neon-cyan',
    shadow: '0 0 30px rgba(0,240,255,0.3), 0 0 60px rgba(0,240,255,0.1)',
    icon: '🧭',
    speed: 6,
  },
  thinking: {
    gradient: 'from-neon-purple via-neon-pink to-neon-purple',
    shadow: '0 0 40px rgba(168,85,247,0.4), 0 0 80px rgba(168,85,247,0.15)',
    icon: '🔮',
    speed: 1.5,
  },
  alert: {
    gradient: 'from-neon-amber via-yellow-400 to-neon-amber',
    shadow: '0 0 40px rgba(245,158,11,0.4), 0 0 80px rgba(245,158,11,0.15)',
    icon: '⚡',
    speed: 0.8,
  },
  error: {
    gradient: 'from-neon-red via-red-400 to-neon-red',
    shadow: '0 0 40px rgba(239,68,68,0.4), 0 0 80px rgba(239,68,68,0.15)',
    icon: '🔴',
    speed: 0.5,
  },
  success: {
    gradient: 'from-neon-green via-emerald-400 to-neon-green',
    shadow: '0 0 30px rgba(34,211,238,0.3), 0 0 60px rgba(34,211,238,0.1)',
    icon: '✨',
    speed: 4,
  },
};

const sizeMap = { sm: 48, md: 72, lg: 96 };

export default function NomadGuide({ state, message, size = 'md', onClick }: NomadGuideProps) {
  const config = stateConfig[state];
  const px = sizeMap[size];

  return (
    <div className="flex items-start gap-4 cursor-pointer select-none" onClick={onClick}>
      {/* Orb */}
      <div className="relative flex-shrink-0">
        {/* Outer glow ring */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} opacity-20 blur-xl`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: config.speed, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: px + 16, height: px + 16, top: -8, left: -8 }}
        />

        {/* Spinning ring for thinking state */}
        {state === 'thinking' && (
          <motion.div
            className="absolute inset-[-4px] rounded-full border-2 border-transparent"
            style={{
              borderTopColor: '#a855f7',
              borderRightColor: '#ec489966',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Main orb */}
        <motion.div
          className={`relative rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
          style={{
            width: px,
            height: px,
            boxShadow: config.shadow,
          }}
          animate={
            state === 'idle'
              ? { y: [0, -8, 0] }
              : state === 'alert'
              ? { scale: [1, 1.1, 1] }
              : state === 'error'
              ? { x: [-2, 2, -2, 2, 0] }
              : {}
          }
          transition={{
            duration: config.speed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Inner glass layer */}
          <div className="absolute inset-[3px] rounded-full bg-obsidian-950/60 backdrop-blur-sm" />

          {/* Icon */}
          <span className="relative z-10 text-lg" style={{ fontSize: px * 0.35 }}>
            {config.icon}
          </span>
        </motion.div>

        {/* Pulse ring for alert */}
        {state === 'alert' && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-neon-amber/50"
            style={{ width: px, height: px }}
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          className="glass px-4 py-3 rounded-2xl rounded-tl-sm max-w-xs relative mt-1"
          initial={{ opacity: 0, x: -10, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-obsidian-200 leading-relaxed">{message}</p>
          {state === 'thinking' && (
            <div className="flex gap-1 mt-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-neon-purple"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
