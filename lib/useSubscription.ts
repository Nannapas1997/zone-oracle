// lib/useSubscription.ts
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

interface SubscriptionState {
  isActive: boolean;
  status: string;
  planId: string | null;
  currentPeriodEnd: string | null;
  loading: boolean;
}

export function useSubscription(): SubscriptionState {
  const { isSignedIn } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    isActive: false,
    status: "none",
    planId: null,
    currentPeriodEnd: null,
    loading: true,
  });

  useEffect(() => {
    if (!isSignedIn) {
      setState(s => ({ ...s, loading: false, isActive: false }));
      return;
    }

    fetch("/api/subscription/status")
      .then(r => r.json())
      .then(data => setState({ ...data, loading: false }))
      .catch(() => setState(s => ({ ...s, loading: false })));
  }, [isSignedIn]);

  return state;
}
