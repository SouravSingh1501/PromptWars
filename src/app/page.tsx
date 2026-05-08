'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import NomadGuide from '@/components/mascot/NomadGuide';

const features = [
  { icon: '🧠', title: 'AI-Powered Planning', desc: 'Gemini 1.5 Pro generates hyper-personalized itineraries from text or photos.', badge: 'Gemini AI', color: 'purple' as const },
  { icon: '⚡', title: 'Live Adaptation', desc: 'Real-time weather and traffic monitoring silently re-routes your day.', badge: 'Real-Time', color: 'amber' as const },
  { icon: '🔋', title: 'Fatigue Intelligence', desc: 'Energy-aware scheduling that auto-injects rest when you need it.', badge: 'Smart', color: 'green' as const },
  { icon: '🛵', title: 'Two-Wheeler Mode', desc: 'Optimized routing for scooters with parking and traffic agility.', badge: 'Unique', color: 'cyan' as const },
  { icon: '♿', title: 'Accessibility First', desc: 'Zero-stairs routes, elevator priority, and ramp-aware navigation.', badge: 'Inclusive', color: 'purple' as const },
  { icon: '📸', title: 'Vision-to-Trip', desc: 'Upload a photo and let AI extract destinations and vibes automatically.', badge: 'Vision AI', color: 'cyan' as const },
];

const stats = [
  { value: '10K+', label: 'Trips Planned' },
  { value: '98%', label: 'Satisfaction' },
  { value: '50+', label: 'Countries' },
  { value: '<3s', label: 'Plan Speed' },
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="cyan" size="md" pulse>AI-Native Travel Intelligence</Badge>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Travel that{' '}
            <span className="bg-gradient-to-r from-neon-cyan via-neon-green to-neon-purple bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
              thinks
            </span>
            <br />
            <span className="text-obsidian-400">ahead of you.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-6 text-lg sm:text-xl text-obsidian-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            NomadIQ is your AI travel operating system. It plans, adapts, and optimizes 
            your journey in real-time — so you can focus on the experience.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              href="/planner"
              className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-green text-obsidian-950 font-bold text-lg shadow-[0_0_30px_rgba(0,240,255,0.2)] hover:shadow-[0_0_50px_rgba(0,240,255,0.4)] transition-all duration-300 hover:scale-105"
            >
              <span>Start Planning</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass border-white/10 text-white font-medium text-lg hover:bg-white/10 transition-all duration-200"
            >
              View Demo Dashboard
            </Link>
          </motion.div>

          {/* Mascot Preview */}
          <motion.div
            className="mt-16 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <NomadGuide state="idle" message="Hey there! I'm Nomad — your AI travel companion. Ready to explore? ✈️" size="lg" />
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl font-bold neon-text-cyan">{stat.value}</div>
              <div className="text-sm text-obsidian-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="purple" size="md">Core Features</Badge>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold">
              Not just a planner.{' '}
              <span className="text-obsidian-500">An operating system.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard className="h-full group">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{feat.icon}</span>
                    <Badge variant={feat.color} size="sm">{feat.badge}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-neon-cyan transition-colors">{feat.title}</h3>
                  <p className="text-sm text-obsidian-400 leading-relaxed">{feat.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <GlassCard variant="neon-cyan" className="text-center py-16 px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to travel <span className="neon-text-cyan">smarter</span>?
              </h2>
              <p className="text-obsidian-400 mb-8 max-w-lg mx-auto">
                Let Nomad plan your next adventure. Upload a photo, type a vibe, or just tell us where you want to go.
              </p>
              <Link
                href="/planner"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-green text-obsidian-950 font-bold text-lg hover:shadow-[0_0_40px_rgba(0,240,255,0.3)] transition-all duration-300"
              >
                🚀 Launch Planner
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧭</span>
            <span className="font-bold">Nomad<span className="text-neon-cyan">IQ</span></span>
            <span className="text-obsidian-600 text-sm">· AI Travel OS</span>
          </div>
          <p className="text-sm text-obsidian-600">
            © {new Date().getFullYear()} NomadIQ. Powered by Gemini & Google Maps.
          </p>
        </div>
      </footer>
    </div>
  );
}
