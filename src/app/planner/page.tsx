'use client';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import EnergyMeter from '../../components/ui/EnergyMeter';
import NomadGuide from '../../components/mascot/NomadGuide';
import { useNomadAI } from '../../hooks/useNomadAI';
import type { PlannerFormState, TransportMode, PacePreference, GenerateItineraryResponse } from '../../lib/types';

const transportOptions: { value: TransportMode; label: string; icon: string }[] = [
  { value: 'walking', label: 'Walking', icon: '🚶' },
  { value: 'public-transit', label: 'Transit', icon: '🚇' },
  { value: 'two-wheeler', label: 'Scooter', icon: '🛵' },
  { value: 'car', label: 'Car', icon: '🚗' },
  { value: 'bicycle', label: 'Bike', icon: '🚲' },
];

const paceOptions: { value: PacePreference; label: string; desc: string }[] = [
  { value: 'relaxed', label: '🌿 Relaxed', desc: '3-4 activities/day' },
  { value: 'moderate', label: '⚡ Moderate', desc: '5-6 activities/day' },
  { value: 'intense', label: '🔥 Intense', desc: '7+ activities/day' },
];

export default function PlannerPage() {
  const { mascotState, message, isGenerating, result, generateTrip } = useNomadAI();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<PlannerFormState>({
    destination: '', startDate: '', endDate: '', prompt: '',
    uploadedImage: null, imagePreview: null,
  });
  const [transport, setTransport] = useState<TransportMode>('public-transit');
  const [pace, setPace] = useState<PacePreference>('moderate');
  const [accessibility, setAccessibility] = useState(false);
  const [budget, setBudget] = useState(100);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(p => ({ ...p, uploadedImage: file, imagePreview: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests(p => [...p, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const handleSubmit = async () => {
    if (!form.destination || !form.startDate || !form.endDate) return;
    let imageBase64: string | undefined;
    if (form.imagePreview) imageBase64 = form.imagePreview.split(',')[1];
    await generateTrip({
      destination: form.destination, startDate: form.startDate, endDate: form.endDate,
      prompt: form.prompt, imageBase64,
      preferences: { transport, pace, accessibility, budgetPerDay: budget, diet: [], interests },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <NomadGuide state={mascotState} message={message} size="md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Form (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          <GlassCard>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>🗺️</span> Trip Details
            </h2>
            <div className="space-y-4">
              <Input label="Destination" placeholder="e.g. Tokyo, Japan" value={form.destination}
                onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
                icon={<span>📍</span>} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" type="date" value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                <Input label="End Date" type="date" value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
              </div>
              <Textarea label="Tell Nomad what you want" placeholder="I love street food, hidden gems, and sunset spots..."
                value={form.prompt} onChange={e => setForm(p => ({ ...p, prompt: e.target.value }))} />

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-obsidian-300 mb-1.5">📸 Vision-to-Trip</label>
                <div
                  className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-neon-cyan/30 hover:bg-white/[0.02] transition-all"
                  onClick={() => fileRef.current?.click()}
                >
                  {form.imagePreview ? (
                    <div className="relative">
                      <img src={form.imagePreview} alt="Upload preview" className="max-h-40 mx-auto rounded-lg" />
                      <button className="absolute top-1 right-1 w-6 h-6 rounded-full bg-obsidian-900/80 text-xs flex items-center justify-center hover:bg-neon-red/50"
                        onClick={e => { e.stopPropagation(); setForm(p => ({ ...p, uploadedImage: null, imagePreview: null })); }}>✕</button>
                    </div>
                  ) : (
                    <div className="text-obsidian-500">
                      <p className="text-2xl mb-2">📷</p>
                      <p className="text-sm">Drop a photo or screenshot — AI will extract trip ideas</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Preferences */}
          <GlassCard>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><span>⚙️</span> Preferences</h2>

            {/* Transport */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-obsidian-300 mb-3">Transport Mode</label>
              <div className="flex flex-wrap gap-2">
                {transportOptions.map(t => (
                  <button key={t.value}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2
                      ${transport === t.value ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30' : 'glass border-white/5 text-obsidian-400 hover:text-white hover:bg-white/5'}`}
                    onClick={() => setTransport(t.value)}>
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pace */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-obsidian-300 mb-3">Pace</label>
              <div className="grid grid-cols-3 gap-3">
                {paceOptions.map(p => (
                  <button key={p.value}
                    className={`px-3 py-3 rounded-xl text-center transition-all duration-200
                      ${pace === p.value ? 'bg-neon-purple/20 border border-neon-purple/30' : 'glass border-white/5 hover:bg-white/5'}`}
                    onClick={() => setPace(p.value)}>
                    <div className="text-sm font-medium">{p.label}</div>
                    <div className="text-[10px] text-obsidian-500 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-obsidian-300">💰 Budget per Day</label>
                <span className="text-sm font-bold text-neon-cyan">${budget}</span>
              </div>
              <input type="range" min="20" max="500" step="10" value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-cyan [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
            </div>

            {/* Accessibility */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">♿ Accessibility Mode</div>
                <div className="text-xs text-obsidian-500">Zero-stairs, ramps, elevators</div>
              </div>
              <button
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${accessibility ? 'bg-neon-cyan' : 'bg-white/10'}`}
                onClick={() => setAccessibility(!accessibility)}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-all duration-300 ${accessibility ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-obsidian-300 mb-2">🎯 Interests</label>
              <div className="flex gap-2 mb-2">
                <input className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder:text-obsidian-500 focus:outline-none focus:border-neon-cyan/40 transition-all"
                  placeholder="Add interest..." value={interestInput}
                  onChange={e => setInterestInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addInterest()} />
                <Button variant="secondary" size="sm" onClick={addInterest}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {interests.map(i => (
                  <Badge key={i} variant="cyan" size="sm">
                    {i}
                    <button className="ml-1 hover:text-white" onClick={() => setInterests(p => p.filter(x => x !== i))}>×</button>
                  </Badge>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Generate Button */}
          <Button size="lg" className="w-full" loading={isGenerating} onClick={handleSubmit}
            disabled={!form.destination || !form.startDate || !form.endDate}>
            {isGenerating ? 'Nomad is planning...' : '✨ Generate Itinerary'}
          </Button>
        </div>

        {/* Right: Results Panel (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <AnimatePresence mode="wait">
            {result ? <ResultsPanel result={result} /> : <PlaceholderPanel />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPanel() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <GlassCard className="text-center py-16">
        <div className="text-5xl mb-4">🌍</div>
        <h3 className="text-lg font-semibold mb-2">Your trip awaits</h3>
        <p className="text-sm text-obsidian-500">Fill in your details and let Nomad craft the perfect itinerary.</p>
      </GlassCard>
    </motion.div>
  );
}

function ResultsPanel({ result }: { result: GenerateItineraryResponse }) {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
      {/* Summary Card */}
      <GlassCard variant="neon-cyan">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">📊 Trip Summary</h3>
          <Badge variant={result.tripSummary.budgetStatus === 'Healthy' ? 'green' : result.tripSummary.budgetStatus === 'Warning' ? 'amber' : 'red'}>
            {result.tripSummary.budgetStatus}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-obsidian-500">Destination</div>
            <div className="font-semibold">{result.tripSummary.destination}</div>
          </div>
          <div>
            <div className="text-xs text-obsidian-500">Activities</div>
            <div className="font-semibold">{result.tripSummary.totalActivities}</div>
          </div>
        </div>
        <EnergyMeter level={100 - result.tripSummary.fatigueScore} />
      </GlassCard>

      {/* Day Tabs */}
      {result.dailyItinerary.length > 0 && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {result.dailyItinerary.map((day, i) => (
              <button key={i}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                  ${activeDay === i ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30' : 'glass text-obsidian-400 hover:text-white'}`}
                onClick={() => setActiveDay(i)}>
                Day {day.day} {day.theme && `· ${day.theme}`}
              </button>
            ))}
          </div>

          {/* Activities List */}
          <div className="space-y-3">
            {result.dailyItinerary[activeDay]?.activities.map((act, i) => (
              <motion.div key={act.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard padding="p-4" className="group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neon-cyan">{act.time}</span>
                      {act.endTime && <span className="text-xs text-obsidian-600">→ {act.endTime}</span>}
                    </div>
                    <Badge variant={act.energyRequirement === 'High' ? 'red' : act.energyRequirement === 'Medium' ? 'amber' : 'green'} size="sm">
                      {act.energyRequirement} · {act.energyCost}⚡
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-sm group-hover:text-neon-cyan transition-colors">{act.activity}</h4>
                  {act.description && <p className="text-xs text-obsidian-500 mt-1 line-clamp-2">{act.description}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-obsidian-600">{act.category}</span>
                    {act.estimatedCost !== undefined && <span className="text-[10px] text-neon-amber">${act.estimatedCost}</span>}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Day Cost Summary */}
          {result.dailyItinerary[activeDay] && (
            <GlassCard padding="p-4">
              <div className="flex justify-between text-sm">
                <span className="text-obsidian-400">Day Total Energy</span>
                <span className="font-semibold">{result.dailyItinerary[activeDay].totalEnergyCost}⚡</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-obsidian-400">Day Estimated Cost</span>
                <span className="font-semibold text-neon-amber">${result.dailyItinerary[activeDay].totalEstimatedCost}</span>
              </div>
            </GlassCard>
          )}
        </>
      )}
    </motion.div>
  );
}
