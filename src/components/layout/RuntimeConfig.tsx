'use client';
import { useEffect } from 'react';
import { setRuntimeFirebaseConfig } from '@/lib/firebase';

interface RuntimeConfigProps {
  firebase: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
  };
}

export default function RuntimeConfig({ firebase }: RuntimeConfigProps) {
  // We initialize this immediately during render to ensure subsequent 
  // imports of firebase.ts (which happen during client-side hydration) 
  // have the correct config.
  setRuntimeFirebaseConfig(firebase);

  return null;
}
