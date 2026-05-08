'use client';
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, createOrUpdateUser } from '@/lib/firebase';
import type { NomadUser } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Ensure user document exists in Firestore
        await createOrUpdateUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(loading => false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
