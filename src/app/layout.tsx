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
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID,
  };

  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__NOMADIQ_CONFIG__ = ${JSON.stringify({
                firebase: firebaseConfig,
                googleMapsKey: googleMapsKey
              })};
            `,
          }}
        />
        <script async src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&libraries=places,geometry`}></script>
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
