"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/auth-context";

const CART_UPDATED_EVENT = "zuri:cart-updated";
export const CART_QUERY_KEY = ["cart-count"] as const;

/** Call this after any cart mutation (add/update/remove/save-for-later/checkout) to refresh the badge. */
export function emitCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
  }
}

async function fetchCartCount(): Promise<number> {
  const res = await fetch("/api/cart");
  if (res.status === 401) return 0;
  if (!res.ok) return 0;
  const data = await res.json();
  const activeItems = (data.activeItems ?? []) as Array<{ quantity: number }>;
  return activeItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}

/** Shared cart item count, kept in sync across the navbar and any page that calls emitCartUpdated(). */
export function useCartCount() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...CART_QUERY_KEY, user?.id ?? null],
    queryFn: fetchCartCount,
    enabled: !authLoading,
    staleTime: 30_000,
  });

  useEffect(() => {
    function handleCartUpdated() {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    }
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    return () => window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
  }, [queryClient]);

  return query.data ?? 0;
}
