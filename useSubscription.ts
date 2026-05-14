import { useSession } from "next-auth/react";

export function useSubscription() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isSignedIn = status === "authenticated";
  const isSubscribed = (session?.user as any)?.isSubscribed ?? false;

  return { isLoading, isSignedIn, isSubscribed };
}
