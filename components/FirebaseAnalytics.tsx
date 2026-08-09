'use client';

// Lightweight wrapper that boots Firebase Analytics on the client. Renders
// nothing — just a side-effect on mount. We expose it as a separate file
// so the page component stays focused on UI state.

import { useEffect } from 'react';
import { getFirebaseAnalytics } from '@/lib/firebase';

export default function FirebaseAnalytics() {
  useEffect(() => {
    // Boot Analytics. logEvent is a no-op in environments that don't
    // support measurement (file://, browser-only tests, etc.).
    getFirebaseAnalytics().catch((err) => {
      // Analytics is non-critical — log and continue.
      console.warn('[firebase] analytics init failed:', err);
    });
  }, []);

  return null;
}
