'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import UserMenu from './UserMenu';

const navLinks = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/planner', label: 'Planner', icon: '🗺️' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span className="text-lg">🧭</span>
            </motion.div>
            <div>
              <span className="text-lg font-bold tracking-tight">
                Nomad<span className="neon-text-cyan">IQ</span>
              </span>
              <span className="hidden sm:block text-[9px] text-obsidian-500 uppercase tracking-[0.2em] -mt-0.5">
                AI Travel OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-xl text-sm text-obsidian-400 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center gap-2"
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA + User + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/planner"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-neon-cyan/90 to-neon-green/80 text-obsidian-950 text-sm font-semibold hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-200"
            >
              <span>✨</span> Plan Trip
            </Link>
            <UserMenu />
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden glass border-t border-white/[0.06]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-obsidian-300 hover:text-white hover:bg-white/5 transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
