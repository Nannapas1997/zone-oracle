// components/ZoneOracleApp.tsx
// The full trading app — same logic as before but wired to useLivePrice()
// instead of the built-in simulation ticker.

import { useState, useEffect, useRef } from "react";
import { UserButton } from "@clerk/nextjs";
import { useLivePrice } from "../lib/useLivePrice";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rnd = (a: number, b: number) => Math.random() * (b - a) + a;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const fmt = (v: number) => Math.round(v * 10) / 10;

// ─── All the calculation/logic functions from the original app ────────────────
// (Identical to the original — zone detection, indicators, probability engine)

const SESSIONS = [
  { name: "Tokyo",    nameTH: "โตเกียว",  start: 0,  end: 9,  color: "#818cf8" },
  { name: "London",   nameTH: "ลอนดอน",  start: 7,  end: 16, color: "#34d399" },
  { name: "New York", nameTH: "นิวยอร์ก", start: 13, end: 22, color: "#f59e0b" },
];

const TF_CONFIG: Record<string, { mins: number; volatility: number; count: number }> = {
  M5:  { mins: 5,    volatility: 0.8,  count: 180 },
  M15: { mins: 15,   volatility: 1.5,  count: 160 },
  H1:  { mins: 60,   volatility: 3.5,  count: 120 },
  H4:  { mins: 240,  volatility: 8.0,  count: 100 },
  D1:  { mins: 1440, volatility: 18.0, count: 80  },
};

const TFS = ["M5", "M15", "H1", "H4", "D1"];

interface Candle { o: number; c: number; h: number; l: number; i: number; }
interface Zone { p: number; type: "S"|"R"; t: number; base: number; bornAt: number; session: string; }

function getSession() {
  const h = new Date().getUTCHours();
  const active = SESSIONS.filter(s => h >= s.start && h < s.end);
  return active.length ? active[active.length - 1] : { name: "Asian", nameTH: "เอเชีย", color: "#818cf8" };
}

function genCandles(base: number, tf: string): Candle[] {
  const { volatility, count } = TF_CONFIG[tf] || TF_CONFIG.M15;
  let p = base;
  return Array.from({ length: count }, (_, i) => {
    const o = p;
    const c = o + rnd(-volatility, volatility);
    const h = Math.max(o, c) + rnd(0.5, volatility * 0.8);
    const l = Math.min(o, c) - rnd(0.5, volatility * 0.8);
    p = c;
    return { o, c, h, l, i };
  });
}

function emaFn(src: number[], p: number): number[] {
  const k = 2 / (p + 1); let e = src[0];
  return src.map(v => (e = v * k + e * (1 - k), e));
}

function rsiFn(candles: Candle[], p = 14): (number | null)[] {
  const cl = candles.map(c => c.c);
  let g = 0, l = 0;
  for (let i = 1; i <= p; i++) { const d = cl[i] - cl[i - 1]; d > 0 ? g += d : l -= d; }
  const out: (number | null)[] = new Array(p).fill(null);
  let ag = g / p, al = l / p;
  out.push(100 - 100 / (1 + ag / (al || .001)));
  for (let i = p + 1; i < cl.length; i++) {
    const d = cl[i] - cl[i - 1];
    ag = (ag * (p - 1) + Math.max(d, 0)) / p;
    al = (al * (p - 1) + Math.max(-d, 0)) / p;
    out.push(100 - 100 / (1 + ag / (al || .001)));
  }
  return out;
}

function macdFn(candles: Candle[]): number[] {
  const cl = candles.map(c => c.c);
  const e12 = emaFn(cl, 12), e26 = emaFn(cl, 26);
  const ml = e12.map((v, i) => v - e26[i]);
  const sig = emaFn(ml, 9);
  return ml.map((v, i) => v - sig[i]);
}

function calcBBFn(candles: Candle[], p = 20) {
  const cl = candles.map(c => c.c);
  return cl.map((_, i) => {
    if (i < p) return null;
    const s = cl.slice(i - p, i);
    const m = s.reduce((a, b) => a + b, 0) / p;
    const std = Math.sqrt(s.reduce((a, b) => a + (b - m) ** 2, 0) / p);
    return { u: m + 2 * std, l: m - 2 * std, m, width: 4 * std / m };
  });
}

function detectZones(candles: Candle[], nearPrice: number): Zone[] {
  const allZones: Zone[] = [];
  const lb = 7;
  for (let i = lb; i < candles.length - lb; i++) {
    const win = candles.slice(i - lb, i + lb + 1);
    const mxH = Math.max(...win.map(c => c.h));
    const mnL = Math.min(...win.map(c => c.l));
    if (candles[i].h >= mxH - .3) {
      const ex = allZones.find(z => z.type === "R" && Math.abs(z.p - candles[i].h) < 10);
      ex ? ex.t++ : allZones.push({ p: fmt(candles[i].h), type: "R", t: 1, base: Math.round(rnd(52, 80)), bornAt: i, session: SESSIONS[Math.floor(rnd(0, 3))].name });
    }
    if (candles[i].l <= mnL + .3) {
      const ex = allZones.find(z => z.type === "S" && Math.abs(z.p - candles[i].l) < 10);
      ex ? ex.t++ : allZones.push({ p: fmt(candles[i].l), type: "S", t: 1, base: Math.round(rnd(52, 80)), bornAt: i, session: SESSIONS[Math.floor(rnd(0, 3))].name });
    }
  }
  const valid = allZones.filter(z => z.t >= 2);
  const r = valid.filter(z => z.type === "R" && z.p > nearPrice).sort((a, b) => a.p - b.p).slice(0, 3);
  const s = valid.filter(z => z.type === "S" && z.p <= nearPrice).sort((a, b) => b.p - a.p).slice(0, 3);
  return [...r, ...s];
}

function getZoneAge(zone: Zone, total: number) {
  const age = total - zone.bornAt;
  if (age < 20) return { label: "PRISTINE", age, color: "#c9a227" };
  if (age < 50) return { label: "AGING", age, color: "#f59e0b" };
  return { label: "MATURE", age, color: "#666" };
}

function getDecay(zone: Zone, total: number) {
  const age = total - zone.bornAt;
  return Math.round(clamp(100 - (zone.t - 1) * 8 - Math.min(age * 0.3, 30), 10, 100));
}

function getHistRecord(zone: Zone) {
  const seed = Math.round(zone.p * 10) % 1000;
  const total = zone.t + Math.floor(seed % 8) + 2;
  let bounces = 0, breaks = 0;
  const events: { type: string; daysAgo: number; price: number }[] = [];
  const rng = (n: number) => { const x = Math.sin(seed * 9301 + n * 49297) * 233280; return x - Math.floor(x); };
  for (let i = 0; i < total; i++) {
    const isBounce = rng(i + seed) < (zone.type === "S" ? 0.62 : 0.58);
    const daysAgo = Math.round(rng(i + seed + 100) * 90) + (i + 1) * 3;
    const price = fmt(zone.p + (rng(i + seed + 200) - 0.5) * 4);
    isBounce ? bounces++ : breaks++;
    events.push({ type: isBounce ? "bounce" : "break", daysAgo, price });
  }
  events.sort((a, b) => b.daysAgo - a.daysAgo);
  return { bounces, breaks, totalTests: total, winRate: Math.round(bounces / total * 100), events };
}

function computeResult(zone: Zone, rsiV: number, macdV: number, bbV: any, e20: number, e50: number, lang: string, total: number) {
  let bp = zone.base;
  const isTH = lang === "TH";
  const factors: { n: string; d: string; v: number }[] = [];
  const hist = getHistRecord(zone);
  const decay = getDecay(zone, total);
  const age = getZoneAge(zone, total);

  if (age.label === "PRISTINE") { bp += 8; factors.push({ n: "Liquidity Decay Index™", d: isTH ? "โซนสดใหม่" : "Virgin zone — full liquidity", v: +8 }); }
  else if (age.label === "AGING") { bp -= 4; factors.push({ n: "Liquidity Decay Index™", d: isTH ? "โซนเริ่มเก่า" : "Aging zone", v: -4 }); }
  else { bp -= 12; factors.push({ n: "Liquidity Decay Index™", d: isTH ? "โซนเก่ามาก" : "Mature — weakened", v: -12 }); }

  if (decay < 40) { bp -= 8; factors.push({ n: "Institutional Memory Score™", d: isTH ? "ความแข็งแกร่งต่ำ" : "Low strength", v: -8 }); }
  else if (decay > 75) { bp += 5; factors.push({ n: "Institutional Memory Score™", d: isTH ? "ความแข็งแกร่งสูง" : "High strength", v: +5 }); }

  if (hist.winRate >= 70) { bp += 10; factors.push({ n: "Institutional Memory Score™", d: `${hist.bounces}/${hist.totalTests} ${isTH ? "เด้ง" : "bounces"}`, v: +10 }); }
  else if (hist.winRate >= 50) { bp += 4; factors.push({ n: "Institutional Memory Score™", d: `${hist.bounces}/${hist.totalTests} ${isTH ? "เด้ง" : "bounces"} — moderate`, v: +4 }); }
  else { bp -= 8; factors.push({ n: "Institutional Memory Score™", d: `${hist.breaks}/${hist.totalTests} ${isTH ? "ทะลุ — ระวัง" : "breaks — caution"}`, v: -8 }); }

  if (zone.type === "S") {
    if (rsiV < 28) { bp += 15; factors.push({ n: "Quantum Pressure Index™", d: isTH ? "< 28 แรงขายอิ่มตัว" : "< 28 — exhaustion", v: +15 }); }
    else if (rsiV < 42) { bp += 7; factors.push({ n: "Quantum Pressure Index™", d: isTH ? "28–42 เริ่มสะสม" : "28–42 accumulation", v: +7 }); }
    else if (rsiV > 63) { bp -= 10; factors.push({ n: "Quantum Pressure Index™", d: isTH ? "สูง — momentum ขาขึ้น" : "Elevated — continuation", v: -10 }); }
    if (macdV > .3) { bp += 9; factors.push({ n: "Vector Divergence Matrix™", d: isTH ? "บวก — แรงซื้อสถาบัน" : "Positive — inst. buy", v: +9 }); }
    else if (macdV < -.3) { bp -= 7; factors.push({ n: "Vector Divergence Matrix™", d: isTH ? "ลบ — แรงขายยังหนัก" : "Negative — sell persists", v: -7 }); }
    if (e20 > e50) { bp += 6; factors.push({ n: "Adaptive Gradient Ribbon™", d: isTH ? "ขาขึ้น — bull structure" : "Ascending — bull", v: +6 }); }
    else { bp -= 5; factors.push({ n: "Adaptive Gradient Ribbon™", d: isTH ? "ขาลง — headwind" : "Descending — headwind", v: -5 }); }
  } else {
    if (rsiV > 72) { bp += 15; factors.push({ n: "Quantum Pressure Index™", d: isTH ? "> 72 แรงซื้ออิ่มตัว" : "> 72 — distribution", v: +15 }); }
    else if (rsiV > 58) { bp += 7; factors.push({ n: "Quantum Pressure Index™", d: isTH ? "58–72 เริ่มระบาย" : "58–72 distribution", v: +7 }); }
    else if (rsiV < 37) { bp -= 10; factors.push({ n: "Quantum Pressure Index™", d: isTH ? "ต่ำ — momentum ขาลง" : "Depressed — continuation", v: -10 }); }
    if (macdV < -.3) { bp += 9; factors.push({ n: "Vector Divergence Matrix™", d: isTH ? "ลบ — แรงขายสถาบัน" : "Negative — inst. sell", v: +9 }); }
    else if (macdV > .3) { bp -= 7; factors.push({ n: "Vector Divergence Matrix™", d: isTH ? "บวก — แรงซื้อยังหนัก" : "Positive — buy persists", v: -7 }); }
    if (e20 < e50) { bp += 6; factors.push({ n: "Adaptive Gradient Ribbon™", d: isTH ? "ขาลง — bear structure" : "Descending — bear", v: +6 }); }
    else { bp -= 5; factors.push({ n: "Adaptive Gradient Ribbon™", d: isTH ? "ขาขึ้น — headwind" : "Ascending — headwind", v: -5 }); }
  }
  if (zone.t >= 4) { bp += 6; factors.push({ n: "Institutional Memory Score™", d: `${zone.t} ${isTH ? "ครั้งที่ยืนยัน" : "confirmed touches"}`, v: +6 }); }

  bp = clamp(Math.round(bp), 24, 94);
  const brk = 100 - bp;
  const str = zone.t * .3 + bp * .04;
  const tp1Pips = Math.round(clamp(100 + str * 40, 100, 480));
  const tp2Pips = Math.round(clamp(500 + str * 150, 500, 1900));
  const tp3Pips = Math.round(clamp(2000 + str * 500, 2000, 5000));
  const dynF = clamp((decay / 100) * .5 + (bp / 100) * .5, 0.2, 1);
  const slPips = tp2Pips < 800 ? Math.round(clamp(500 - dynF * 200, 300, 500)) : tp2Pips < 1500 ? Math.round(clamp(1000 - dynF * 500, 500, 1000)) : Math.round(clamp(1500 - dynF * 500, 1000, 1500));
  const pip = (p: number) => p * 0.01;
  const sl = zone.type === "S" ? fmt(zone.p - pip(slPips)) : fmt(zone.p + pip(slPips));
  const tp1 = zone.type === "S" ? fmt(zone.p + pip(tp1Pips)) : fmt(zone.p - pip(tp1Pips));
  const tp2 = zone.type === "S" ? fmt(zone.p + pip(tp2Pips)) : fmt(zone.p - pip(tp2Pips));
  const tp3 = zone.type === "S" ? fmt(zone.p + pip(tp3Pips)) : fmt(zone.p - pip(tp3Pips));
  const vectorBias = zone.type === "S" ? "BUY" : "SELL";
  return { bp, brk, factors, sl, tp1, tp2, tp3, tp1Pips, tp2Pips, tp3Pips, slPips, age, decay, hist, vectorBias };
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props { userName?: string; }

const BASE = 2347;

export default function ZoneOracleApp({ userName }: Props) {
  const [lang, setLang] = useState<"TH"|"EN">("TH");
  const [tf, setTf] = useState("M15");
  const [candles, setCandles] = useState<Candle[]>(() => genCandles(BASE, "M15"));
  const [tab, setTab] = useState("zones");
  const [selZone, setSelZone] = useState<Zone | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [session] = useState(getSession());
  const [frozenZones, setFrozenZones] = useState<Zone[]>([]);
  const [snapTime, setSnapTime] = useState("--:--");
  const [alertZones, setAlertZones] = useState<number[]>([]);
  const [touchedZone, setTouchedZone] = useState<number | null>(null);

  // ── LIVE PRICE — wired to TwelveData WebSocket ────────────────────────────
  const {
    price: live,
    source: priceSource,
    connected: priceConnected,
  } = useLivePrice({
    // If no API key is set, falls back to simulation automatically
    fallbackBase: BASE,
    simulate: !process.env.NEXT_PUBLIC_TWELVEDATA_KEY && !process.env.NEXT_PUBLIC_FINNHUB_KEY,
  });

  // ── Candle builder — appends ticks into OHLC bars ─────────────────────────
  const prevLiveRef = useRef(live);
  useEffect(() => {
    const prev = prevLiveRef.current;
    prevLiveRef.current = live;
    if (prev === live) return;

    setCandles(prev => {
      const last = prev[prev.length - 1];
      const upd = { ...last, c: live, h: Math.max(last.h, live), l: Math.min(last.l, live) };
      const tfMins = TF_CONFIG[tf]?.mins ?? 15;
      const nowMin = new Date().getUTCMinutes();
      // New candle on minute boundary
      if (nowMin % tfMins === 0 && Math.abs(live - last.o) > 0.5) {
        return [...prev.slice(-TF_CONFIG[tf].count + 1), upd, { o: live, c: live, h: live + 0.1, l: live - 0.1, i: prev.length }];
      }
      return [...prev.slice(0, -1), upd];
    });

    // Zone touch detection
    frozenZones.forEach(z => {
      if (Math.abs(live - z.p) < 2) {
        setTouchedZone(z.p);
        setTimeout(() => setTouchedZone(null), 2000);
      }
    });
  }, [live, tf, frozenZones]);

  // ── Zone snapshot ─────────────────────────────────────────────────────────
  const takeSnapshot = (c: Candle[], price: number) => {
    setFrozenZones(detectZones(c, price));
    setSnapTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  };

  useEffect(() => { takeSnapshot(candles, live); }, []);

  const changeTf = (t: string) => {
    setTf(t);
    const nc = genCandles(live, t);
    setCandles(nc);
    setSelZone(null); setResult(null);
    takeSnapshot(nc, live);
  };

  // ── Indicators ────────────────────────────────────────────────────────────
  const e20arr = emaFn(candles.map(c => c.c), 20);
  const e50arr = emaFn(candles.map(c => c.c), 50);
  const rsiArr = rsiFn(candles);
  const macdArr = macdFn(candles);
  const bbArr = calcBBFn(candles);
  const rsiV = (rsiArr[rsiArr.length - 1] as number) ?? 50;
  const macdV = macdArr[macdArr.length - 1] ?? 0;
  const bbV = bbArr[bbArr.length - 1];
  const e20V = e20arr[e20arr.length - 1];
  const e50V = e50arr[e50arr.length - 1];

  function pickZone(z: Zone) {
    setSelZone(z); setLoading(true); setResult(null); setTab("analysis");
    setTimeout(() => {
      setResult(computeResult(z, rsiV, macdV, bbV, e20V, e50V, lang, candles.length));
      setLoading(false);
    }, 600);
  }

  const above = frozenZones.filter(z => z.type === "R").sort((a, b) => a.p - b.p);
  const below = frozenZones.filter(z => z.type === "S").sort((a, b) => b.p - a.p);
  const zC = selZone?.type === "S" ? "#00e5a0" : "#ff4d6d";
  const isS = selZone?.type === "S";

  const W = 600, H = 190;
  const vis = candles.slice(-80);
  const all = vis.flatMap(c => [c.h, c.l]);
  const mn = Math.min(...all) - 4, mx = Math.max(...all) + 4;
  const pad = { l: 46, r: 8, t: 10, b: 8 };
  const ph = H - pad.t - pad.b;
  const cw = (W - pad.l - pad.r) / vis.length;
  const py = (p: number) => pad.t + ph - ((p - mn) / (mx - mn)) * ph;
  const cx = (i: number) => pad.l + i * cw + cw * .5;
  const vz = frozenZones.filter(z => z.p >= mn && z.p <= mx);

  const sourceColor = priceSource === "twelvedata" ? "#00e5a0" : priceSource === "finnhub" ? "#f59e0b" : "#555";
  const sourceName = priceSource === "twelvedata" ? "TWELVEDATA WS" : priceSource === "finnhub" ? "FINNHUB REST" : "SIMULATION";

  const TABS = [["zones", lang === "TH" ? "แผนที่โซน" : "ZONE MAP"], ["analysis", lang === "TH" ? "วิเคราะห์เชิงลึก" : "DEEP ANALYSIS"]];

  return (
    <div style={{ minHeight: "100vh", background: "#050510", color: "#c8c0a8", fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .fade{animation:fade .35s ease}
        @keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .zrow{cursor:pointer;transition:all .15s}.zrow:hover{border-color:#c9a22740!important;transform:translateX(2px)}
        .pulse{animation:pulse 2.5s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
        button{cursor:pointer;transition:filter .15s;font-family:'DM Mono',monospace}button:hover{filter:brightness(1.15)}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a1a30;border-radius:2px}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background: "#08081a", borderBottom: "1px solid #0f0f28", padding: "0 16px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 54 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 5, color: "#c9a227" }}>ZONE ORACLE</div>
            <div style={{ width: 1, height: 20, background: "#0f0f28" }} />
            {/* Live price source badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", background: `${sourceColor}12`, border: `1px solid ${sourceColor}30`, borderRadius: 5 }}>
              <div className="pulse" style={{ width: 4, height: 4, borderRadius: "50%", background: sourceColor }} />
              <span style={{ fontSize: 7, color: sourceColor, letterSpacing: 1 }}>{sourceName}</span>
            </div>
            <div style={{ padding: "3px 8px", background: "#c9a22710", border: "1px solid #c9a22730", borderRadius: 5, fontSize: 6.5, color: "#c9a22780", letterSpacing: 1 }}>◆ PRO</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {userName && <div style={{ fontSize: 8, color: "#333", letterSpacing: 1 }}>สวัสดี, {userName}</div>}
            <button onClick={() => setLang(l => l === "TH" ? "EN" : "TH")} style={{ background: "#0d0d22", border: "1px solid #c9a22740", borderRadius: 6, padding: "4px 10px", color: "#c9a227", fontSize: 9, letterSpacing: 2 }}>
              {lang === "TH" ? "EN" : "TH"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div className="pulse" style={{ width: 4, height: 4, borderRadius: "50%", background: "#00e5a0" }} />
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 23, letterSpacing: 3, color: "#c9a227" }}>{live.toFixed(2)}</div>
            </div>
            {/* Clerk UserButton — handles logout */}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "12px 12px" }}>

        {/* ── CHART ── */}
        <div style={{ background: "#080818", border: "1px solid #0f0f28", borderRadius: 13, padding: "10px 6px", marginBottom: 10, overflow: "hidden" }}>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
            {[.25, .5, .75].map((t, i) => <line key={i} x1={pad.l} x2={W - pad.r} y1={pad.t + ph * t} y2={pad.t + ph * t} stroke="#0f0f22" strokeWidth="1" />)}
            {vz.map((z, i) => (
              <g key={i}>
                <rect x={pad.l} y={py(z.p) - 5} width={W - pad.l - pad.r} height={10} fill={z.type === "S" ? "#00e5a006" : "#ff4d6d06"} />
                <line x1={pad.l} x2={W - pad.r} y1={py(z.p)} y2={py(z.p)} stroke={z.type === "S" ? "#00e5a0" : "#ff4d6d"} strokeWidth={touchedZone === z.p ? "2" : "1"} strokeDasharray={touchedZone === z.p ? "none" : "5,4"} opacity={touchedZone === z.p ? 1 : .5} />
                <text x={W - pad.r - 2} y={py(z.p) - 4} textAnchor="end" fill={z.type === "S" ? "#00e5a060" : "#ff4d6d60"} fontSize="7.5" fontFamily="monospace">{z.p}</text>
              </g>
            ))}
            {vis.map((c, i) => {
              const bull = c.c >= c.o, col = bull ? "#00e5a0" : "#ff4d6d";
              const bT = py(Math.max(c.o, c.c)), bH = Math.max(1, Math.abs(py(c.o) - py(c.c)));
              return <g key={i}><line x1={cx(i)} x2={cx(i)} y1={py(c.h)} y2={py(c.l)} stroke={col} strokeWidth=".9" opacity=".8" /><rect x={cx(i) - cw * .38} y={bT} width={cw * .76} height={bH} fill={col} rx=".5" /></g>;
            })}
            {live >= mn && live <= mx && <>
              <line x1={pad.l} x2={W - pad.r} y1={py(live)} y2={py(live)} stroke="#c9a227" strokeWidth="1.2" strokeDasharray="4,3" opacity=".8" />
              <rect x={pad.l - 2} y={py(live) - 8} width={42} height={16} fill="#c9a22720" rx="3" />
              <text x={pad.l + 19} y={py(live) + 4} textAnchor="middle" fill="#c9a227" fontSize="8" fontFamily="monospace">{live.toFixed(1)}</text>
            </>}
            {[.25, .5, .75].map((t, i) => <text key={i} x={pad.l - 4} y={pad.t + ph * (1 - t) + 3} textAnchor="end" fill="#2a2a45" fontSize="8" fontFamily="monospace">{Math.round(mn + (mx - mn) * t)}</text>)}
            <text x={pad.l + 6} y={pad.t + 13} fill="#2a2a45" fontSize="8" fontFamily="monospace" letterSpacing="2">{tf} · XAUUSD · {sourceName}</text>
          </svg>
        </div>

        {/* ── TF SELECTOR ── */}
        <div style={{ display: "flex", gap: 5, marginBottom: 10, alignItems: "center" }}>
          <div style={{ fontSize: 7, color: "#252540", letterSpacing: 2, marginRight: 2 }}>TF</div>
          {TFS.map(t => (
            <button key={t} onClick={() => changeTf(t)}
              style={{ background: tf === t ? "#c9a22718" : "transparent", border: `1px solid ${tf === t ? "#c9a22750" : "#0f0f28"}`, borderRadius: 6, padding: "5px 11px", color: tf === t ? "#c9a227" : "#2a2a45", fontSize: 8.5, letterSpacing: 1.5 }}>
              {t}
            </button>
          ))}
          <button onClick={() => takeSnapshot(candles, live)}
            style={{ marginLeft: "auto", background: "#c9a22710", border: "1px solid #c9a22730", borderRadius: 6, padding: "5px 12px", color: "#c9a22760", fontSize: 7.5, letterSpacing: 1 }}>
            ↻ {lang === "TH" ? "รีเฟรชโซน" : "REFRESH ZONES"} · {snapTime}
          </button>
        </div>

        {/* ── TABS ── */}
        <div style={{ display: "flex", gap: 3, marginBottom: 10, background: "#080818", border: "1px solid #0f0f28", borderRadius: 10, padding: 4 }}>
          {TABS.map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, background: tab === t ? "#c9a22718" : "transparent", border: `1px solid ${tab === t ? "#c9a22745" : "transparent"}`, borderRadius: 7, padding: "9px 0", color: tab === t ? "#c9a227" : "#2a2a45", fontSize: 7.5, letterSpacing: 1 }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── ZONE MAP ── */}
        {tab === "zones" && (
          <div className="fade">
            {/* Resistance zones */}
            {above.length > 0 && <>
              <div style={{ fontSize: 7.5, color: "#ff4d6d50", letterSpacing: 2, marginBottom: 8 }}>▲ {lang === "TH" ? "แนวต้านเหนือราคา" : "OVERHEAD RESISTANCE"}</div>
              {above.map((z, i) => {
                const age = getZoneAge(z, candles.length);
                const decay = getDecay(z, candles.length);
                return (
                  <div key={i} className="zrow" onClick={() => pickZone(z)}
                    style={{ background: "#080818", border: `1px solid ${touchedZone === z.p ? "#ff4d6d60" : "#0f0f28"}`, borderRadius: 10, padding: "11px 14px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 2, height: 34, background: "#ff4d6d", borderRadius: 2 }} />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 21, color: "#ff4d6d", letterSpacing: 2 }}>{z.p}</div>
                          <div style={{ fontSize: 6.5, color: age.color, border: `1px solid ${age.color}40`, borderRadius: 3, padding: "1px 5px" }}>{age.label}</div>
                          <div style={{ fontSize: 6.5, color: "#555", border: "1px solid #1a1a28", borderRadius: 3, padding: "1px 5px" }}>💪{decay}</div>
                        </div>
                        <div style={{ fontSize: 7, color: "#ff4d6d40" }}>
                          {lang === "TH" ? "แนวต้าน" : "RESISTANCE"} · {z.t} {lang === "TH" ? "ครั้ง" : "touches"} · +{(z.p - live).toFixed(1)} pt · {z.session}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: "#1e1e35" }}>›</div>
                  </div>
                );
              })}
            </>}

            {/* Live price row */}
            <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "10px 0", padding: "8px 14px", background: "#c9a22708", border: "1px solid #c9a22720", borderRadius: 8 }}>
              <div className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a227" }} />
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: "#c9a227", letterSpacing: 3 }}>{live.toFixed(2)}</div>
              <div style={{ fontSize: 7, color: "#c9a22750" }}>LIVE · {sourceName}</div>
            </div>

            {/* Support zones */}
            {below.length > 0 && <>
              <div style={{ fontSize: 7.5, color: "#00e5a050", letterSpacing: 2, marginBottom: 8, marginTop: 4 }}>▼ {lang === "TH" ? "แนวรับต่ำกว่าราคา" : "UNDERLYING SUPPORT"}</div>
              {below.map((z, i) => {
                const age = getZoneAge(z, candles.length);
                const decay = getDecay(z, candles.length);
                return (
                  <div key={i} className="zrow" onClick={() => pickZone(z)}
                    style={{ background: "#080818", border: `1px solid ${touchedZone === z.p ? "#00e5a060" : "#0f0f28"}`, borderRadius: 10, padding: "11px 14px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 2, height: 34, background: "#00e5a0", borderRadius: 2 }} />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 21, color: "#00e5a0", letterSpacing: 2 }}>{z.p}</div>
                          <div style={{ fontSize: 6.5, color: age.color, border: `1px solid ${age.color}40`, borderRadius: 3, padding: "1px 5px" }}>{age.label}</div>
                          <div style={{ fontSize: 6.5, color: "#555", border: "1px solid #1a1a28", borderRadius: 3, padding: "1px 5px" }}>💪{decay}</div>
                        </div>
                        <div style={{ fontSize: 7, color: "#00e5a040" }}>
                          {lang === "TH" ? "แนวรับ" : "SUPPORT"} · {z.t} {lang === "TH" ? "ครั้ง" : "touches"} · -{(live - z.p).toFixed(1)} pt · {z.session}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: "#1e1e35" }}>›</div>
                  </div>
                );
              })}
            </>}
          </div>
        )}

        {/* ── DEEP ANALYSIS ── */}
        {tab === "analysis" && (
          <div className="fade">
            {loading && <div style={{ textAlign: "center", padding: "80px 0", fontFamily: "'Bebas Neue'", fontSize: 13, color: "#c9a227", letterSpacing: 6, animation: "pulse 2s infinite" }}>COMPUTING...</div>}
            {!loading && !result && <div style={{ textAlign: "center", padding: "80px 0", color: "#151528", fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 3 }}>{lang === "TH" ? "เลือกโซนก่อน" : "SELECT A ZONE FIRST"}</div>}
            {!loading && result && selZone && <>
              {/* Zone header */}
              <div style={{ background: "#080818", border: `1px solid ${zC}20`, borderRadius: 12, padding: "14px 15px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 7, color: "#252545", letterSpacing: 1, marginBottom: 4 }}>ENTRY PRICE (FIXED)</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: zC, letterSpacing: 3 }}>{selZone.p}</div>
                    <div style={{ fontSize: 7, color: `${zC}50`, marginTop: 4 }}>{isS ? "SUPPORT" : "RESISTANCE"} · {selZone.t} confirmed</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 7, color: "#252545" }}>LIVE</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: "#c9a227", letterSpacing: 2 }}>{live.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Vector Bias */}
              <div style={{ background: result.vectorBias === "BUY" ? "#00e5a008" : "#ff4d6d08", border: `1.5px solid ${result.vectorBias === "BUY" ? "#00e5a040" : "#ff4d6d40"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -8, top: -12, fontFamily: "'Bebas Neue'", fontSize: 90, color: result.vectorBias === "BUY" ? "#00e5a006" : "#ff4d6d06", lineHeight: 1 }}>
                  {result.vectorBias === "BUY" ? "↑" : "↓"}
                </div>
                <div style={{ fontSize: 7, color: "#252545", letterSpacing: 3, marginBottom: 8 }}>VECTOR BIAS™</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: result.vectorBias === "BUY" ? "#00e5a018" : "#ff4d6d18", border: `1px solid ${result.vectorBias === "BUY" ? "#00e5a040" : "#ff4d6d40"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: result.vectorBias === "BUY" ? "#00e5a0" : "#ff4d6d", lineHeight: 1 }}>{result.vectorBias === "BUY" ? "↑" : "↓"}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: result.vectorBias === "BUY" ? "#00e5a0" : "#ff4d6d", letterSpacing: 4 }}>
                      {result.vectorBias === "BUY" ? "PRIME LONG" : "PRIME SHORT"}
                    </div>
                    <div style={{ fontSize: 7, color: result.vectorBias === "BUY" ? "#00e5a070" : "#ff4d6d70", marginTop: 2 }}>
                      {result.vectorBias === "BUY"
                        ? (lang === "TH" ? "สถาบันสะสม — ยืนยันแรงซื้อ" : "Institutional accumulation — long bias confirmed")
                        : (lang === "TH" ? "สถาบันระบาย — ยืนยันแรงขาย" : "Distribution phase — short bias confirmed")}
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 30, color: result.vectorBias === "BUY" ? "#00e5a0" : "#ff4d6d" }}>{result.bp}%</div>
                    <div style={{ fontSize: 7, color: "#252545" }}>CONFIDENCE</div>
                  </div>
                </div>
              </div>

              {/* Probability */}
              <div style={{ background: "#080818", border: "1px solid #0f0f28", borderRadius: 12, padding: "14px 15px", marginBottom: 8 }}>
                <div style={{ fontSize: 7.5, color: "#252545", letterSpacing: 2, marginBottom: 14 }}>DIRECTIONAL PROBABILITY MATRIX</div>
                {[
                  { label: isS ? "REVERSAL ↑" : "REVERSAL ↓", pct: result.bp, col: zC, arrow: isS ? "↑" : "↓" },
                  { label: isS ? "FRACTURE ↓" : "FRACTURE ↑", pct: result.brk, col: "#2a2a50", arrow: isS ? "↓" : "↑" },
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: i === 0 ? 14 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 5, background: i === 0 ? `${zC}18` : "#1a1a28", border: `1px solid ${i === 0 ? zC + "40" : "#1e1e35"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 16, color: i === 0 ? zC : "#333", fontWeight: "bold" }}>{item.arrow}</span>
                        </div>
                        <div style={{ fontSize: 10, color: i === 0 ? "#bbb" : "#444" }}>{item.label}</div>
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 38, color: i === 0 ? zC : "#252545", letterSpacing: 2 }}>{item.pct}%</div>
                    </div>
                    <div style={{ background: "#0a0a1c", borderRadius: 5, height: 7, overflow: "hidden" }}>
                      <div style={{ width: `${item.pct}%`, height: "100%", background: i === 0 ? `linear-gradient(90deg,${zC},${zC}80)` : "linear-gradient(90deg,#1e1e40,#2a2a55)", borderRadius: 5, transition: "width 1.5s ease" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Execution Levels */}
              <div style={{ background: "#080818", border: "1px solid #0f0f28", borderRadius: 12, padding: "13px 15px", marginBottom: 8 }}>
                <div style={{ fontSize: 7.5, color: "#252545", letterSpacing: 2, marginBottom: 11 }}>EXECUTION LEVELS</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 7 }}>
                  <div style={{ background: "#0a0a1c", border: "1px solid #ff4d6d20", borderRadius: 9, padding: "10px 12px" }}>
                    <div style={{ fontSize: 6.5, color: "#ff4d6d70", marginBottom: 5 }}>SL · INVALIDATION</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 21, color: "#ff4d6d" }}>{result.sl}</div>
                    <div style={{ fontSize: 7, color: "#ff4d6d40", marginTop: 3 }}>{result.slPips} pips</div>
                  </div>
                  <div style={{ background: "#0a0a1c", border: `1px solid ${zC}20`, borderRadius: 9, padding: "10px 12px" }}>
                    <div style={{ fontSize: 6.5, color: `${zC}70`, marginBottom: 5 }}>ENTRY</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 21, color: zC }}>{selZone.p}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {[
                    { label: "TP1", val: result.tp1, pips: result.tp1Pips, col: "#60a5fa" },
                    { label: "TP2", val: result.tp2, pips: result.tp2Pips, col: "#f59e0b" },
                    { label: "TP3", val: result.tp3, pips: result.tp3Pips, col: "#e879f9" },
                  ].map((tp, i) => (
                    <div key={i} style={{ background: "#0a0a1c", border: `1px solid ${tp.col}20`, borderRadius: 9, padding: "10px 11px" }}>
                      <div style={{ fontSize: 6.5, color: `${tp.col}70`, marginBottom: 4 }}>{tp.label}</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: tp.col }}>{tp.val}</div>
                      <div style={{ fontSize: 6.5, color: `${tp.col}50`, marginTop: 3 }}>{tp.pips} pips</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confluence */}
              <div style={{ background: "#080818", border: "1px solid #0f0f28", borderRadius: 12, padding: "13px 15px", marginBottom: 8 }}>
                <div style={{ fontSize: 7.5, color: "#252545", letterSpacing: 2, marginBottom: 11 }}>SIGNAL CONFLUENCE</div>
                {result.factors.map((f: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: i < result.factors.length - 1 ? "1px solid #0a0a1c" : "none" }}>
                    <div>
                      <div style={{ fontSize: 8, color: "#555" }}>{f.n}</div>
                      <div style={{ fontSize: 7, color: "#2a2a45", marginTop: 2 }}>{f.d}</div>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 14, color: f.v > 0 ? "#00e5a0" : "#ff4d6d", marginLeft: 10 }}>
                      {f.v > 0 ? "+" : ""}{f.v}%
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "8px 12px", background: "#06060f", borderRadius: 8, fontSize: 7, color: "#151528", letterSpacing: .5 }}>
                Zone Oracle outputs are probabilistic estimates. Not financial advice.
              </div>
            </>}
          </div>
        )}
      </div>
    </div>
  );
}
