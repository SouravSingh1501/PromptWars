import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { AuthProvider } from '@/components/layout/AuthProvider';
import SetupGuard from '@/components/layout/SetupGuard';

export const metadata: Metadata = {
  title: 'NomadIQ – AI Travel Operating System',
  description: 'Your hyper-personalized AI travel concierge. Plan smarter trips with real-time adaptation, fatigue-aware scheduling, and autonomous route optimization.',
  keywords: ['travel', 'AI', 'itinerary', 'planner', 'smart travel', 'NomadIQ'],
  openGraph: {
    title: 'NomadIQ – AI Travel Operating System',
    description: 'Plan trips that think. AI-powered itineraries that adapt in real-time.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Placeholder for Google Maps - User should replace with their API key */}
        <script async src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`}></script>
      </head>
      <body className="antialiased">
        <div className="ambient-bg" />
        <SetupGuard>
          <AuthProvider>
            <Navbar />
            <main className="pt-16 min-h-screen">{children}</main>
          </AuthProvider>
        </SetupGuard>
      </body>
    </html>
  );
}
