'use client';
import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import { AlertTriangle, CloudRain, Wind, Thermometer } from 'lucide-react';

interface WeatherDisruptionProps {
  city: string;
  temp: number;
  condition: string;
  disruption?: {
    type: 'traffic' | 'weather' | 'closure';
    message: string;
    impactScore: number; // 0-10
  };
}

export default function WeatherDisruptionHUD({ city, temp, condition, disruption }: WeatherDisruptionProps) {
  const isRaining = condition.toLowerCase().includes('rain');

  return (
    <GlassCard variant={disruption ? 'neon-purple' : 'default'} className="relative overflow-hidden">
      {/* Background Icon Watermark */}
      <div className="absolute -right-4 -bottom-4 opacity-5">
        {isRaining ? <CloudRain size={120} /> : <Thermometer size={120} />}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-obsidian-500 font-bold">Local Intel</p>
            <h3 className="text-lg font-bold">{city}</h3>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span>{temp}°C</span>
              <CloudRain className={isRaining ? 'text-neon-cyan' : 'text-obsidian-400'} size={24} />
            </div>
            <p className="text-xs text-obsidian-400">{condition}</p>
          </div>
        </div>

        {/* Disruption Alert Area */}
        {disruption ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-neon-purple/10 border border-neon-purple/20 mt-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-neon-purple" />
              <span className="text-xs font-bold uppercase tracking-tight text-neon-purple">Active Disruption</span>
              <Badge variant="purple" className="ml-auto">Impact {disruption.impactScore}/10</Badge>
            </div>
            <p className="text-xs text-obsidian-200 leading-relaxed">
              {disruption.message}
            </p>
            <div className="mt-3 flex gap-2">
              <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-neon-purple"
                  initial={{ width: 0 }}
                  animate={{ width: `${disruption.impactScore * 10}%` }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Wind size={12} className="text-neon-green" />
              <span className="text-[10px] text-obsidian-400">12km/h SE</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Thermometer size={12} className="text-neon-amber" />
              <span className="text-[10px] text-obsidian-400">UV Index: 2</span>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
