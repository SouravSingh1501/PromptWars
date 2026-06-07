'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EnergyMeter from '@/components/ui/EnergyMeter';
import MusafirGuide from '@/components/mascot/MusafirGuide';
import BentoGrid, { BentoItem } from '@/components/layout/BentoGrid';
import MapView from '@/components/ui/MapView';
import WeatherDisruptionHUD from '@/components/ui/WeatherDisruptionHUD';
import type { MascotState, Activity } from '@/lib/types';

// Demo data for dashboard showcase
const demoTrip = {
  title: 'Tokyo Explorer',
  destination: 'Tokyo, Japan',
  dates: 'May 12 – May 17, 2026',
  daysLeft: 4,
  progress: 35,
  fatigue: 62,
  center: { lat: 35.6762, lng: 139.6503, placeId: '' },
  budget: { spent: 340, limit: 800, currency: 'USD' },
  todayActivities: [
    { id: '1', time: '09:00', activity: 'Tsukiji Outer Market', energyRequirement: 'Medium', energyCost: 25, locationData: { lat: 35.6655, lng: 139.7707, placeId: '' }, category: '🍣 Food' },
    { id: '2', time: '11:30', activity: 'TeamLab Borderless', energyRequirement: 'Low', energyCost: 32, locationData: { lat: 35.6251, lng: 139.7756, placeId: '' }, category: '🎨 Art' },
    { id: '3', time: '14:00', activity: '☕ Rest & Recharge', energyRequirement: 'Low', energyCost: 8, locationData: { lat: 35.6600, lng: 139.7000, placeId: '' }, category: '😴 Rest' },
    { id: '4', time: '15:30', activity: 'Meiji Shrine', energyRequirement: 'Medium', energyCost: 0, locationData: { lat: 35.6764, lng: 139.6993, placeId: '' }, category: '⛩️ Culture' },
    { id: '5', time: '17:30', activity: 'Harajuku & Takeshita St.', energyRequirement: 'Medium', energyCost: 40, locationData: { lat: 35.6716, lng: 139.7029, placeId: '' }, category: '🛍️ Shopping' },
    { id: '6', time: '19:30', activity: 'Shibuya Crossing Sunset', energyRequirement: 'Low', energyCost: 0, locationData: { lat: 35.6595, lng: 139.7005, placeId: '' }, category: '📸 Scenic' },
  ],
  alerts: [
    { type: 'weather', message: 'Light rain expected at 16:00. Indoor alternatives ready.', status: 'pending' as const },
  ],
  transport: [
    { from: 'Hotel', to: 'Tsukiji', mode: '🚇 Transit', time: '22 min' },
    { from: 'Tsukiji', to: 'TeamLab', mode: '🛵 Scooter', time: '15 min' },
    { from: 'TeamLab', to: 'Meiji Shrine', mode: '🚇 Transit', time: '28 min' },
  ],
};

export default function DashboardPage() {
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [mascotMsg, setMascotMsg] = useState("You're on track! Meiji Shrine is next. 🏯");

  const budgetPercent = (demoTrip.budget.spent / demoTrip.budget.limit) * 100;
  const budgetColor = budgetPercent > 80 ? 'red' : budgetPercent > 60 ? 'amber' : 'cyan';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{demoTrip.title}</h1>
            <Badge variant="cyan" pulse>Live</Badge>
          </div>
          <p className="text-sm text-obsidian-500">{demoTrip.destination} · {demoTrip.dates}</p>
        </div>
        <MusafirGuide state={mascotState} message={mascotMsg} size="sm" />
      </div>

      {/* Bento Dashboard */}
      <BentoGrid columns={3}>
        {/* Map View - Spans 2 cols and 2 rows */}
        <BentoItem span={2} rowSpan={2}>
          <MapView 
            center={demoTrip.center} 
            activities={demoTrip.todayActivities as any} 
            className="h-full min-h-[500px]"
          />
        </BentoItem>

        {/* Progress Overview */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-obsidian-400 mb-4">📅 Trip Progress</h3>
          <div className="flex items-end justify-between mb-3">
            <span className="text-4xl font-bold neon-text-cyan">Day 2</span>
            <span className="text-sm text-obsidian-500">of 5</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 mb-2">
            <motion.div className="h-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
              initial={{ width: 0 }} animate={{ width: `${demoTrip.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }} />
          </div>
          <p className="text-xs text-obsidian-500">{demoTrip.progress}% complete · {demoTrip.daysLeft} days remaining</p>
        </GlassCard>

        {/* Energy Battery */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-obsidian-400 mb-4">🔋 Energy Level</h3>
          <div className="mb-4">
            <EnergyMeter level={demoTrip.fatigue} size="lg" />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm"
              onClick={() => { setMascotState('alert'); setMascotMsg('Injecting a rest break at 14:00. You deserve it! ☕'); setTimeout(() => setMascotState('idle'), 3000); }}>
              + Add Rest
            </Button>
            <Button variant="ghost" size="sm">Swap Activity</Button>
          </div>
        </GlassCard>

        {/* Today's Schedule - spans 2 cols */}
        <BentoItem span={2}>
          <GlassCard>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-obsidian-400">📋 Today&apos;s Schedule</h3>
              <Badge variant="purple" size="sm">{demoTrip.todayActivities.length} activities</Badge>
            </div>
            <div className="space-y-2">
              {demoTrip.todayActivities.map((act, i) => (
                <motion.div key={i}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 glass-hover bg-white/[0.02]"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}>
                  {/* Time */}
                  <span className="text-xs font-mono w-12 text-neon-cyan">{act.time}</span>
                  {/* Completion dot */}
                  <div className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-obsidian-600" />
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{act.activity}</div>
                    <div className="text-[10px] text-obsidian-600">{act.category}</div>
                  </div>
                  {/* Energy + Cost */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={(act.energyRequirement as string) === 'High' ? 'red' : act.energyRequirement === 'Medium' ? 'amber' : 'green'} size="sm">{act.energyRequirement}</Badge>
                    {act.energyCost > 0 && <span className="text-xs text-neon-amber">${act.energyCost}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </BentoItem>

        {/* Budget Tracker */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-obsidian-400 mb-4">💰 Budget</h3>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-3xl font-bold">${demoTrip.budget.spent}</span>
            <span className="text-sm text-obsidian-500 mb-1">/ ${demoTrip.budget.limit}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 mb-2">
            <motion.div className="h-2 rounded-full bg-neon-cyan"
              initial={{ width: 0 }} animate={{ width: `${budgetPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }} />
          </div>
          <div className="flex justify-between text-xs text-obsidian-500">
            <span>~${Math.round((demoTrip.budget.limit - demoTrip.budget.spent) / demoTrip.daysLeft)}/day</span>
            <Badge variant={budgetColor === 'cyan' ? 'green' : budgetColor} size="sm">
              {budgetPercent > 80 ? 'Over' : 'Healthy'}
            </Badge>
          </div>
        </GlassCard>

        {/* Alerts & Transport */}
        <BentoItem span={3}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <WeatherDisruptionHUD 
              city="Tokyo"
              temp={22}
              condition="Light Rain"
              disruption={{
                type: 'weather',
                message: 'Rain expected at 16:00. Shadow Plan active: Swapping Park for Art Museum.',
                impactScore: 7
              }}
            />

            <GlassCard className="md:col-span-2">
              <h3 className="text-sm font-semibold text-obsidian-400 mb-4">🚀 Transport Plan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {demoTrip.transport.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="flex-1">
                      <p className="text-[10px] text-obsidian-500 uppercase tracking-tighter">Leg {i + 1}</p>
                      <span className="text-white text-xs">{t.from} → {t.to}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs block text-neon-cyan">{t.mode}</span>
                      <span className="text-[10px] text-obsidian-500">{t.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </BentoItem>
      </BentoGrid>
    </div>
  );
}
