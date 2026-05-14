// lib/useLivePrice.ts
// Connects to TwelveData WebSocket for real-time XAUUSD price.
// Falls back to Finnhub polling if WebSocket fails.

import { useState, useEffect, useRef, useCallback } from "react";

const SYMBOL_TD = "XAU/USD";       // TwelveData symbol
const SYMBOL_FH = "OANDA:XAU_USD"; // Finnhub symbol

interface PriceTick {
  price: number;
  timestamp: number;
  source: "twelvedata" | "finnhub" | "simulation";
}

interface UseLivePriceOptions {
  fallbackBase?: number;        // Simulation base price if both APIs fail
  simulate?: boolean;            // Force simulation mode (no API keys)
}

export function useLivePrice(options: UseLivePriceOptions = {}): PriceTick & { connected: boolean } {
  const { fallbackBase = 2347, simulate = false } = options;

  const tdKey = process.env.NEXT_PUBLIC_TWELVEDATA_KEY;
  const fhKey = process.env.NEXT_PUBLIC_FINNHUB_KEY;

  const [tick, setTick] = useState<PriceTick>({
    price: fallbackBase,
    timestamp: Date.now(),
    source: "simulation",
  });
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const fhIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Simulation fallback ──────────────────────────────────────────────────
  const startSimulation = useCallback((base: number) => {
    let p = base;
    simIntervalRef.current = setInterval(() => {
      const d = (Math.random() - 0.5) * 0.3;
      p = Math.round((p + d) * 100) / 100;
      setTick({ price: p, timestamp: Date.now(), source: "simulation" });
    }, 800);
  }, []);

  // ── Finnhub REST polling (fallback) ───────────────────────────────────────
  const startFinnhubPolling = useCallback(() => {
    if (!fhKey) { startSimulation(fallbackBase); return; }

    const poll = async () => {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${SYMBOL_FH}&token=${fhKey}`
        );
        const data = await res.json();
        if (data.c && data.c > 0) {
          setTick({ price: data.c, timestamp: Date.now(), source: "finnhub" });
          setConnected(true);
        }
      } catch {
        // Silent fail — keep polling
      }
    };

    poll(); // Immediate first fetch
    fhIntervalRef.current = setInterval(poll, 10_000); // Poll every 10s
  }, [fhKey, fallbackBase, startSimulation]);

  // ── TwelveData WebSocket ──────────────────────────────────────────────────
  const connectTwelveData = useCallback(() => {
    if (!tdKey) { startFinnhubPolling(); return; }

    const ws = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${tdKey}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: "subscribe", params: { symbols: SYMBOL_TD } }));
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // TwelveData sends { event: "price", symbol, price, timestamp }
        if (data.event === "price" && data.price > 0) {
          setTick({
            price: parseFloat(data.price),
            timestamp: Date.now(),
            source: "twelvedata",
          });
        }
      } catch { /* ignore parse errors */ }
    };

    ws.onerror = () => {
      setConnected(false);
      startFinnhubPolling(); // Fallback
    };

    ws.onclose = () => {
      setConnected(false);
      // Reconnect after 5s
      setTimeout(connectTwelveData, 5_000);
    };
  }, [tdKey, startFinnhubPolling]);

  useEffect(() => {
    if (simulate || (!tdKey && !fhKey)) {
      startSimulation(fallbackBase);
    } else {
      connectTwelveData();
    }

    return () => {
      wsRef.current?.close();
      if (fhIntervalRef.current) clearInterval(fhIntervalRef.current);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [simulate, tdKey, fhKey]);

  return { ...tick, connected };
}
