'use client';
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { LocationData, Activity } from '@/lib/types';

interface MapViewProps {
  center: LocationData;
  activities?: Activity[];
  zoom?: number;
  className?: string;
}

const OBSIDIAN_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1f' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1f' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#84858f' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#f5f5f6' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#adaeb5' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#112211' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#242429' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#333338' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c42' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d0d10' }] },
];

export default function MapView({ center, activities = [], zoom = 12, className = '' }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    // Note: This assumes the Google Maps script is loaded in the Root Layout
    if (!window.google || !mapRef.current) return;

    if (!googleMap.current) {
      googleMap.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: center.lat, lng: center.lng },
        zoom,
        styles: OBSIDIAN_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
      });
    } else {
      googleMap.current.setCenter({ lat: center.lat, lng: center.lng });
    }

    // Add markers for activities
    activities.forEach((act) => {
      new window.google.maps.Marker({
        position: { lat: act.locationData.lat, lng: act.locationData.lng },
        map: googleMap.current,
        title: act.activity,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#00f0ff',
          fillOpacity: 1,
          strokeColor: '#0d0d10',
          strokeWeight: 2,
          scale: 8,
        },
      });
    });
  }, [center, activities, zoom]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-2xl glass border border-white/5 ${className}`}
    >
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
      
      {/* HUD Overlays */}
      <div className="absolute top-4 left-4 z-10 space-y-2 pointer-events-none">
        <div className="glass px-3 py-1.5 rounded-lg text-[10px] font-mono text-neon-cyan uppercase tracking-widest border-neon-cyan/20">
          Neural Map View
        </div>
        <div className="glass px-3 py-1.5 rounded-lg text-[10px] font-mono text-white/40 uppercase tracking-widest">
          LAT: {center.lat.toFixed(4)} / LNG: {center.lng.toFixed(4)}
        </div>
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-cyan/30 rounded-tl-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-purple/30 rounded-br-2xl pointer-events-none" />
    </motion.div>
  );
}
