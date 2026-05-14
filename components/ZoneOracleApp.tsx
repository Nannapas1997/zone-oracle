// lib/useSubscription.ts
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface SubscriptionState {
  isActive: boolean;
  status: string;
  planId: string | null;
  currentPeriodEnd: string | null;
  loading: boolean;
}

export function useSubscription(): SubscriptionState {
  const { status } = useSession();
  const isSignedIn = status === "authenticated";

  const [state, setState] = useState<SubscriptionState>({
    isActive: false,
    status: "none",
    planId: null,
    currentPeriodEnd: null,
    loading: true,
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!isSignedIn) {
      setState(s => ({ ...s, loading: false, isActive: false }));
      return;
    }

    fetch("/api/subscription/status")
      .then(r => r.json())
      .then(data => setState({ ...data, loading: false }))
      .catch(() => setState(s => ({ ...s, loading: false })));
  }, [isSignedIn, status]);

  return state;
}