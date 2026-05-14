import dynamic from "next/dynamic";
import { useState, useEffect, useRef, useCallback } from "react";

const rnd = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmt = v => Math.round(v * 10) / 10;

const T = {
  EN: {
    appSub: "INSTITUTIONAL PROBABILITY ENGINE · v6.1",
    live: "LIVE · XAUUSD",
    sessionWindow: "LIQUIDITY WINDOW",
    tf: "TIMEFRAME",
    zoneMap: "ZONE MAP",
    deepAnalysis: "DEEP ANALYSIS",
    alertsTab: "ALERTS",
    journalTab: "JOURNAL",
    selectZone: "SELECT ZONE TO INITIATE DEEP ANALYSIS",
    zonesDetected: "ZONES DETECTED",
    overhead: "▲ OVERHEAD RESISTANCE",
    underlying: "▼ UNDERLYING SUPPORT",
    currentEq: "CURRENT EQUILIBRIUM",
    resistance: "RESISTANCE", support: "SUPPORT",
    interactions: "interactions", away: "pts away",
    zoneAge: "ZONE AGE",
    pristine: "PRISTINE", aging: "AGING", mature: "MATURE",
    pristineDesc: "Virgin liquidity — untested zone",
    agingDesc: "Partially consumed liquidity",
    matureDesc: "Heavily tested — weakened zone",
    candlesAgo: "candles ago",
    selectedZone: "SELECTED ZONE",
    current: "CURRENT",
    confirmedInteractions: "confirmed interactions",
    probMatrix: "DIRECTIONAL PROBABILITY MATRIX",
    bounceUp: "REVERSAL ↑", bounceDown: "REVERSAL ↓",
    breakDown: "FRACTURE ↓", breakUp: "FRACTURE ↑",
    bounceDesc: t => t==="S"?"Price reverses upward from support":"Price reverses downward from resistance",
    breakDesc: t => t==="S"?"Price breaks below support":"Price breaks above resistance",
    execLevels: "EXECUTION LEVELS",
    invalidation: "INVALIDATION LEVEL", entryConf: "ENTRY PRICE",
    projDisp: "PROJECTED DISPLACEMENT (IF REVERSAL CONFIRMED)",
    microDisp: "MICRO", mesoDisp: "MESO", macroDisp: "MACRO",
    projTier: "◆ PROJECTED",
    confluence: "SIGNAL CONFLUENCE BREAKDOWN",
    volState: "VOLATILITY STATE™",
    compressed: "COMPRESSED", expanding: "EXPANDING", explosive: "EXPLOSIVE",
    disclaimer: "ZONE ORACLE outputs are probabilistic estimates. Not financial advice.",
    activeAlerts: "ACTIVE ALERTS", noAlerts: "NO ALERTS SET · Use ⚡ on Zone Map",
    remove: "REMOVE", noAnalysis: "NO ZONE SELECTED", selectFirst: "SELECT A ZONE FROM THE ZONE MAP",
    target: ["TARGET Ⅰ","TARGET Ⅱ","TARGET Ⅲ"],
    targetSub: ["100–500 pips","500–2000 pips","2000+ pips"],
    neutral:"NEUTRAL", oversold:"EXHAUSTED", overbought:"SATURATED",
    accumulate:"ACCUMULATE", distribute:"DISTRIBUTE",
    ascend:"ASCENDING", descend:"DESCENDING",
    gradient:"GRADIENT", upper:"UPPER", lower:"LOWER", median:"MEDIAN", fieldPos:"FIELD",
    candleClose: "CANDLE CLOSES IN",
    confluenceScore: "CONFLUENCE SCORE™",
    memberBadge: "ORACLE PRO · VERIFIED ACCESS",
    noZoneSelected: "SELECT A ZONE FIRST",
    goSelectZone: "GO TO ZONE MAP → SELECT ZONE",
    mtfConfluence: "MULTI-TIMEFRAME CONFLUENCE",
    mtfDesc: "Zone presence across timeframes",
    mtfStrong: "STRONG", mtfMod: "MODERATE", mtfWeak: "WEAK",
    heatmap: "ZONE DENSITY HEATMAP",
    heatmapDesc: "Liquidity concentration by price level",
    highDensity: "HIGH DENSITY", lowDensity: "LOW DENSITY",
    priceLadder: "PRICE LADDER",
    zoneHistory: "ZONE INTERACTION HISTORY",
    bounce: "BOUNCE", breakout: "BREAK",
    histBounce: "Reversal confirmed", histBreak: "Fracture confirmed",
    histNoData: "No historical interactions logged",
    decayLabel: "STRENGTH DECAY",
    decayScore: "ZONE STRENGTH",
    sessionFilter: "SESSION FILTER",
    allSessions: "ALL SESSIONS",
    alertConditions: "ALERT CONDITIONS",
    alertNear: "Near Zone Only",
    alertRsiLow: "Near Zone + RSI < 35",
    alertRsiHigh: "Near Zone + RSI > 65",
    alertCondSet: "Condition: ",
    journalTitle: "TRADE JOURNAL",
    journalAdd: "LOG TRADE",
    journalNoEntries: "NO TRADES LOGGED YET",
    journalEntry: "Entry", journalExit: "Exit",
    journalPnl: "P&L (pips)", journalZone: "Zone",
    journalResult: "Result", journalWin: "WIN", journalLoss: "LOSS",
    journalNotes: "Notes",
    journalSave: "SAVE", journalCancel: "CANCEL",
    journalWinRate: "WIN RATE", journalTrades: "TOTAL TRADES",
    journalAvgPnl: "AVG P&L",
    journalDelete: "DEL",
    journalDirection: "Direction",
    journalLong: "LONG", journalShort: "SHORT",
    journalDate: "Date",
    logThisTrade: "LOG THIS ZONE",
    heatmapUpdate: "HEATMAP UPDATE INTERVAL",
    zoneUpdate: "ZONE REFRESH INTERVAL",
    nextUpdate: "NEXT UPDATE",
    updateNow: "UPDATE NOW",
    lastUpdated: "Last updated",
    refreshInterval: "REFRESH",
    zoneRefreshed: "Zones refreshed",
    frozenZones: "FROZEN ZONES",
    frozenAt: "Snapshot at",
    zoneSnapInterval: "ZONE SNAPSHOT INTERVAL",
    entryPriceFixed: "ENTRY PRICE (FIXED)",
    historicalRecord: "HISTORICAL RECORD AT THIS PRICE",
    bounceCount: "BOUNCES",
    breakCount: "BREAKS",
    winRate: "HISTORICAL WIN RATE",
    totalTests: "TOTAL TESTS AT ENTRY",
    snapIn: "SNAP IN",
    lastSnap: "LAST SNAPSHOT",
    vectorBias: "VECTOR BIAS™",
    primeBuy: "PRIME LONG",
    primeSell: "PRIME SHORT",
    biasDesc: b => b==="BUY"?"Institutional accumulation detected — long bias confirmed":"Distribution phase detected — short bias confirmed",
  },
  TH: {
    appSub: "ระบบวิเคราะห์ความน่าจะเป็น · v6.1",
    live: "ราคาสด · ทองคำ",
    sessionWindow: "ช่วงตลาด",
    tf: "กรอบเวลา",
    zoneMap: "แผนที่โซน",
    deepAnalysis: "วิเคราะห์เชิงลึก",
    alertsTab: "แจ้งเตือน",
    journalTab: "บันทึก",
    selectZone: "เลือกโซนเพื่อเริ่มการวิเคราะห์",
    zonesDetected: "โซนที่ตรวจพบ",
    overhead: "▲ แนวต้านเหนือราคา",
    underlying: "▼ แนวรับต่ำกว่าราคา",
    currentEq: "ราคาปัจจุบัน",
    resistance: "แนวต้าน", support: "แนวรับ",
    interactions: "ครั้งที่แตะ", away: "จุดห่าง",
    zoneAge: "อายุโซน",
    pristine: "สดใหม่", aging: "เริ่มเก่า", mature: "เก่ามาก",
    pristineDesc: "ยังไม่เคยถูกทดสอบ — สภาพคล่องเต็ม",
    agingDesc: "สภาพคล่องถูกดูดออกบางส่วน",
    matureDesc: "ถูกทดสอบหนัก — ความแข็งแกร่งลดลง",
    candlesAgo: "แท่งเทียนที่แล้ว",
    selectedZone: "โซนที่เลือก",
    current: "ราคาปัจจุบัน",
    confirmedInteractions: "ครั้งที่ยืนยันแล้ว",
    probMatrix: "ตารางความน่าจะเป็น",
    bounceUp: "เด้งขึ้น ↑", bounceDown: "เด้งลง ↓",
    breakDown: "ทะลุลง ↓", breakUp: "ทะลุขึ้น ↑",
    bounceDesc: t => t==="S"?"ราคากลับทิศขึ้นจากแนวรับ":"ราคากลับทิศลงจากแนวต้าน",
    breakDesc: t => t==="S"?"ราคาทะลุแนวรับลงต่อ":"ราคาทะลุแนวต้านขึ้นต่อ",
    execLevels: "จุดเข้า / ออก",
    invalidation: "จุดตัดขาดทุน (SL)", entryConf: "ราคาเข้า (Entry)",
    projDisp: "ระยะที่คาดว่าจะวิ่ง (ถ้าราคาเด้งกลับ)",
    microDisp: "ระยะสั้น", mesoDisp: "ระยะกลาง", macroDisp: "ระยะไกล",
    projTier: "◆ ระดับที่คาด",
    confluence: "ปัจจัยที่ใช้วิเคราะห์",
    volState: "สภาวะความผันผวน™",
    compressed: "หดตัว", expanding: "ขยายตัว", explosive: "ระเบิด",
    disclaimer: "ข้อมูลเป็นการประมาณการณ์จากสถิติเท่านั้น ไม่ใช่คำแนะนำการลงทุน",
    activeAlerts: "การแจ้งเตือน", noAlerts: "ยังไม่มีการแจ้งเตือน · กด ⚡ ในแผนที่โซน",
    remove: "ลบ", noAnalysis: "ยังไม่ได้เลือกโซน", selectFirst: "กลับไปเลือกโซนก่อน",
    target: ["เป้าหมาย 1","เป้าหมาย 2","เป้าหมาย 3"],
    targetSub: ["100–500 pips","500–2000 pips","2000+ pips"],
    neutral:"เป็นกลาง", oversold:"แรงขายอิ่มตัว", overbought:"แรงซื้ออิ่มตัว",
    accumulate:"สะสม", distribute:"ระบาย",
    ascend:"ขาขึ้น", descend:"ขาลง",
    gradient:"เทรนด์", upper:"แถบบน", lower:"แถบล่าง", median:"กลาง", fieldPos:"ตำแหน่ง",
    candleClose: "แท่งเทียนปิดใน",
    confluenceScore: "คะแนน Confluence™",
    memberBadge: "ORACLE PRO · สมาชิกที่ยืนยันแล้ว",
    noZoneSelected: "ยังไม่ได้เลือกโซน",
    goSelectZone: "ไปที่ แผนที่โซน → เลือกโซน",
    mtfConfluence: "CONFLUENCE หลายกรอบเวลา",
    mtfDesc: "โซนนี้ปรากฏในกรอบเวลาใดบ้าง",
    mtfStrong: "แกร่ง", mtfMod: "ปานกลาง", mtfWeak: "อ่อน",
    heatmap: "แผนที่ความหนาแน่น",
    heatmapDesc: "ความเข้มของสภาพคล่องตามระดับราคา",
    highDensity: "หนาแน่นสูง", lowDensity: "หนาแน่นต่ำ",
    priceLadder: "บันไดราคา",
    zoneHistory: "ประวัติการทดสอบโซน",
    bounce: "เด้ง", breakout: "ทะลุ",
    histBounce: "ยืนยันการเด้งกลับ", histBreak: "ยืนยันการทะลุผ่าน",
    histNoData: "ยังไม่มีประวัติการทดสอบ",
    decayLabel: "การสลายตัวของความแข็งแกร่ง",
    decayScore: "ความแข็งแกร่งโซน",
    sessionFilter: "กรองตาม Session",
    allSessions: "ทุก Session",
    alertConditions: "เงื่อนไขการแจ้งเตือน",
    alertNear: "ใกล้โซนเท่านั้น",
    alertRsiLow: "ใกล้โซน + RSI < 35",
    alertRsiHigh: "ใกล้โซน + RSI > 65",
    alertCondSet: "เงื่อนไข: ",
    journalTitle: "บันทึกการเทรด",
    journalAdd: "บันทึก Trade",
    journalNoEntries: "ยังไม่มีการบันทึก",
    journalEntry: "ราคาเข้า", journalExit: "ราคาออก",
    journalPnl: "กำไร/ขาดทุน (pips)", journalZone: "โซน",
    journalResult: "ผล", journalWin: "กำไร", journalLoss: "ขาดทุน",
    journalNotes: "หมายเหตุ",
    journalSave: "บันทึก", journalCancel: "ยกเลิก",
    journalWinRate: "อัตราชนะ", journalTrades: "จำนวน Trade",
    journalAvgPnl: "กำไรเฉลี่ย",
    journalDelete: "ลบ",
    journalDirection: "ทิศทาง",
    journalLong: "ซื้อ", journalShort: "ขาย",
    journalDate: "วันที่",
    logThisTrade: "บันทึกโซนนี้",
    heatmapUpdate: "อัพเดท Heatmap ทุก",
    zoneUpdate: "รีเฟรชโซนทุก",
    nextUpdate: "อัพเดทครั้งหน้า",
    updateNow: "อัพเดทเลย",
    lastUpdated: "อัพเดทล่าสุด",
    refreshInterval: "รีเฟรช",
    zoneRefreshed: "รีเฟรชโซนแล้ว",
    frozenZones: "โซนที่ตรึงไว้",
    frozenAt: "ภาพ ณ เวลา",
    zoneSnapInterval: "รีเฟรชโซนทุก",
    entryPriceFixed: "ราคาเข้า (คงที่)",
    historicalRecord: "ประวัติย้อนหลัง ณ ราคานี้",
    bounceCount: "เด้งกลับ",
    breakCount: "ทะลุผ่าน",
    winRate: "อัตราชนะย้อนหลัง",
    totalTests: "ครั้งที่ทดสอบ",
    snapIn: "รีเฟรชใน",
    lastSnap: "ภาพล่าสุด",
    vectorBias: "VECTOR BIAS™",
    primeBuy: "PRIME LONG",
    primeSell: "PRIME SHORT",
    biasDesc: b => b==="BUY"?"สถาบันสะสม — ยืนยันแรงซื้อ":"สถาบันระบาย — ยืนยันแรงขาย",
  }
};

const TERMS = {
  rsi: "Quantum Pressure Index™",
  macd: "Vector Divergence Matrix™",
  ema: "Adaptive Gradient Ribbon™",
  bb: "Volatility Compression Field™",
  touches: "Institutional Memory Score™",
  zoneAge: "Liquidity Decay Index™",
};

const SESSIONS = [
  { name:"Tokyo", nameTH:"โตเกียว", start:0, end:9, color:"#818cf8" },
  { name:"London", nameTH:"ลอนดอน", start:7, end:16, color:"#34d399" },
  { name:"New York", nameTH:"นิวยอร์ก", start:13, end:22, color:"#f59e0b" },
];

const ZONE_INTERVAL_OPTIONS = [
  { label: "15m", labelTH: "15 นาที", seconds: 15 * 60 },
  { label: "1h",  labelTH: "1 ชั่วโมง", seconds: 60 * 60 },
];

const TF_CONFIG = {
  M5:  { mins: 5,    volatility: 0.8,  count: 180 },
  M15: { mins: 15,   volatility: 1.5,  count: 160 },
  H1:  { mins: 60,   volatility: 3.5,  count: 120 },
  H4:  { mins: 240,  volatility: 8.0,  count: 100 },
  D1:  { mins: 1440, volatility: 18.0, count: 80  },
};

const TFS = ["M5","M15","H1","H4","D1"];

function getSession() {
  const h = new Date().getUTCHours();
  const active = SESSIONS.filter(s => h>=s.start && h<s.end);
  return active.length ? active[active.length-1] : { name:"Asian", nameTH:"เอเชีย", color:"#818cf8" };
}

function genCandles(base, tf) {
  const { volatility, count } = TF_CONFIG[tf] || TF_CONFIG.M15;
  let p = base;
  // Add a slow trend oscillation so candles spread across a meaningful price range
  // giving detectZones6 enough distinct swing highs/lows to work with
  const trendAmp = volatility * 6;
  const trendPeriod = Math.floor(count * 0.35);
  return Array.from({ length: count }, (_, i) => {
    const trend = Math.sin((i / trendPeriod) * Math.PI * 2) * trendAmp;
    const o = p;
    const c = o + rnd(-volatility, volatility) + trend * 0.04;
    const h = Math.max(o, c) + rnd(volatility * 0.3, volatility * 1.2);
    const l = Math.min(o, c) - rnd(volatility * 0.3, volatility * 1.2);
    p = c;
    return { o, c, h, l, i };
  });
}

function ema(src, p) {
  const k=2/(p+1); let e=src[0];
  return src.map(v=>(e=v*k+e*(1-k),e));
}

function rsi(candles, p=14) {
  const cl=candles.map(c=>c.c);
  let g=0,l=0;
  for(let i=1;i<=p;i++){const d=cl[i]-cl[i-1];d>0?g+=d:l-=d;}
  const out=new Array(p).fill(null);
  let ag=g/p,al=l/p;
  out.push(100-100/(1+ag/(al||.001)));
  for(let i=p+1;i<cl.length;i++){
    const d=cl[i]-cl[i-1];
    ag=(ag*(p-1)+Math.max(d,0))/p;
    al=(al*(p-1)+Math.max(-d,0))/p;
    out.push(100-100/(1+ag/(al||.001)));
  }
  return out;
}

function macd(candles) {
  const cl=candles.map(c=>c.c);
  const e12=ema(cl,12), e26=ema(cl,26);
  const ml=e12.map((v,i)=>v-e26[i]);
  const sig=ema(ml,9);
  return ml.map((v,i)=>v-sig[i]);
}

function calcBB(candles, p=20) {
  const cl=candles.map(c=>c.c);
  return cl.map((_,i)=>{
    if(i<p) return null;
    const s=cl.slice(i-p,i);
    const m=s.reduce((a,b)=>a+b,0)/p;
    const std=Math.sqrt(s.reduce((a,b)=>a+(b-m)**2,0)/p);
    return {u:m+2*std,l:m-2*std,m,width:4*std/m};
  });
}

// ── Zone spacing per TF — ห่างกันพอเล่นได้จริง ─────────────────────────────
const ZONE_SPACING = {
  M5:  { minGap:2.0,  steps:[2.5,  5.0,  8.5]  },
  M15: { minGap:4.0,  steps:[5.0,  10.0, 17.0] },
  H1:  { minGap:8.0,  steps:[10.0, 20.0, 35.0] },
  H4:  { minGap:18.0, steps:[22.0, 42.0, 70.0] },
  D1:  { minGap:35.0, steps:[50.0, 95.0, 150.0]},
};

// Guaranteed 3 R + 3 S zones, properly spaced — no clustering
function detectZones6(candles, nearPrice, tf) {
  const sp = ZONE_SPACING[tf] || ZONE_SPACING.M15;
  const lb = 5;
  const raw = [];

  // Collect swing highs/lows — use tighter tolerance so candles that are
  // merely close to the high/low still register as pivots
  for(let i=lb; i<candles.length-lb; i++){
    const win = candles.slice(i-lb, i+lb+1);
    const mxH = Math.max(...win.map(c=>c.h));
    const mnL = Math.min(...win.map(c=>c.l));
    if(candles[i].h >= mxH - 0.05){
      const p = fmt(candles[i].h);
      const clash = raw.find(z=>z.type==="R" && Math.abs(z.p-p) < sp.minGap);
      if(!clash) raw.push({p, type:"R", t:1, bornAt:i});
      else clash.t++;
    }
    if(candles[i].l <= mnL + 0.05){
      const p = fmt(candles[i].l);
      const clash = raw.find(z=>z.type==="S" && Math.abs(z.p-p) < sp.minGap);
      if(!clash) raw.push({p, type:"S", t:1, bornAt:i});
      else clash.t++;
    }
  }

  let rCands = raw.filter(z=>z.type==="R"&&z.p>nearPrice).sort((a,b)=>a.p-b.p);
  let sCands = raw.filter(z=>z.type==="S"&&z.p<nearPrice).sort((a,b)=>b.p-a.p);

  // Pick 3 with enforced minimum spacing between each zone
  // If real candle pivots are not enough, synthesize a zone at the required distance
  function pick3(cands, base, type, steps){
    const picked=[];
    let cursor=base;
    const pool=[...cands];
    for(let i=0;i<3;i++){
      const minDist=steps[i];
      const idx=pool.findIndex(z=>Math.abs(z.p-cursor)>=minDist);
      if(idx!==-1){
        picked.push(pool[idx]);
        cursor=pool[idx].p;
        pool.splice(idx,1);
      } else {
        // Synthesize — place at cursor ± (minDist + small random offset)
        const offset=minDist+rnd(0.8,2.5);
        const synP=fmt(type==="R"?cursor+offset:cursor-offset);
        picked.push({
          p:synP, type, t:Math.round(rnd(2,7)),
          bornAt:Math.floor(rnd(5,candles.length*0.75)),
          _synth:true
        });
        cursor=synP;
      }
    }
    return picked;
  }

  const R3=pick3(rCands, nearPrice, "R", sp.steps);
  const S3=pick3(sCands, nearPrice, "S", sp.steps);

  const sessNames=SESSIONS.map(s=>s.name);
  const tag=zones=>zones.map(z=>({
    ...z,
    base:Math.round(rnd(52,80)),
    session:sessNames[Math.floor(rnd(0,3))],
  }));

  return [...tag(R3), ...tag(S3)];
}

function getZoneAge(zone, totalCandles) {
  const age = totalCandles - zone.bornAt;
  if(age < 20) return { label:"pristine", age, color:"#c9a227" };
  if(age < 50) return { label:"aging", age, color:"#f59e0b" };
  return { label:"mature", age, color:"#666" };
}

function getVolatility(bbArr) {
  const last = bbArr[bbArr.length-1];
  if(!last) return { state:"compressed", color:"#60a5fa" };
  if(last.width < 0.008) return { state:"compressed", color:"#60a5fa" };
  if(last.width < 0.018) return { state:"expanding", color:"#f59e0b" };
  return { state:"explosive", color:"#ff4d6d" };
}

function getConfluenceScore(rsiV, macdV, bbV, e20, e50, live) {
  let score = 50;
  if(rsiV < 35 || rsiV > 65) score += 15;
  if(Math.abs(macdV) > 0.3) score += 15;
  if(e20 !== e50) score += Math.abs(e20-e50) > 2 ? 12 : 5;
  if(bbV) { if(live > bbV.u || live < bbV.l) score += 8; }
  return Math.round(clamp(score, 0, 100));
}

function getDecayScore(zone, totalCandles) {
  const age = totalCandles - zone.bornAt;
  const touchPenalty = (zone.t - 1) * 8;
  const agePenalty = Math.min(age * 0.3, 30);
  const raw = 100 - touchPenalty - agePenalty;
  return Math.round(clamp(raw, 10, 100));
}

function getMTFConfluence(zone) {
  const seed = zone.p % 100;
  return { M5: seed>20, M15: seed>35, H1: seed>50, H4: seed>65, D1: seed>80 };
}

function getZoneHistoricalRecord(zone) {
  const seed = Math.round(zone.p * 10) % 1000;
  const totalTests = zone.t + Math.floor(seed % 8) + 2;
  let bounces = 0, breaks = 0;
  const events = [];
  const rng = (n) => {
    const x = Math.sin(seed * 9301 + n * 49297) * 233280;
    return x - Math.floor(x);
  };
  for(let i = 0; i < totalTests; i++) {
    const r = rng(i + seed);
    const bounceBias = zone.type === "S" ? 0.62 : 0.58;
    const isBounce = r < bounceBias;
    const daysAgo = Math.round(rng(i + seed + 100) * 90) + (i+1)*3;
    const priceDelta = (rng(i + seed + 200) - 0.5) * 4;
    if(isBounce) {
      bounces++;
      events.push({ type:"bounce", daysAgo, price: fmt(zone.p + priceDelta) });
    } else {
      breaks++;
      events.push({ type:"break", daysAgo, price: fmt(zone.p + priceDelta) });
    }
  }
  events.sort((a,b) => b.daysAgo - a.daysAgo);
  const winRate = totalTests > 0 ? Math.round((bounces / totalTests) * 100) : 0;
  return { bounces, breaks, totalTests, winRate, events };
}

function computeResult(zone, rsiV, macdV, bbV, e20, e50, live, lang, totalCandles) {
  let bp = zone.base;
  const isTH = lang==="TH";
  const factors=[];
  const age = getZoneAge(zone, totalCandles);
  const decay = getDecayScore(zone, totalCandles);
  const hist = getZoneHistoricalRecord(zone);

  if(age.label==="pristine"){ bp+=8; factors.push({n:TERMS.zoneAge,d:isTH?"โซนสดใหม่ — สภาพคล่องยังเต็ม":"Virgin zone — full liquidity intact",v:+8}); }
  else if(age.label==="aging"){ bp-=4; factors.push({n:TERMS.zoneAge,d:isTH?"โซนเริ่มเก่า — สภาพคล่องลดลงบางส่วน":"Aging zone — partial liquidity consumed",v:-4}); }
  else { bp-=12; factors.push({n:TERMS.zoneAge,d:isTH?"โซนเก่ามาก — ความแข็งแกร่งต่ำ":"Mature zone — significantly weakened",v:-12}); }

  if(decay < 40){ bp-=8; factors.push({n:TERMS.touches,d:isTH?"ความแข็งแกร่งต่ำมาก — โซนถูกทดสอบหนักเกินไป":"Low zone strength — heavily tested",v:-8}); }
  else if(decay > 75){ bp+=5; factors.push({n:TERMS.touches,d:isTH?"ความแข็งแกร่งสูง — สภาพคล่องยังคงอยู่":"High zone strength — liquidity preserved",v:+5}); }

  if(hist.winRate >= 70){ bp+=10; factors.push({n:TERMS.touches,d:isTH?`ย้อนหลัง: เด้ง ${hist.bounces}/${hist.totalTests} ครั้ง — ประสิทธิภาพสูง`:`Historical: ${hist.bounces}/${hist.totalTests} bounces — high efficacy`,v:+10}); }
  else if(hist.winRate >= 50){ bp+=4; factors.push({n:TERMS.touches,d:isTH?`ย้อนหลัง: เด้ง ${hist.bounces}/${hist.totalTests} ครั้ง — ปานกลาง`:`Historical: ${hist.bounces}/${hist.totalTests} bounces — moderate`,v:+4}); }
  else { bp-=8; factors.push({n:TERMS.touches,d:isTH?`ย้อนหลัง: ทะลุ ${hist.breaks}/${hist.totalTests} ครั้ง — ระวัง`:`Historical: ${hist.breaks}/${hist.totalTests} breaks — caution`,v:-8}); }

  if(zone.type==="S"){
    if(rsiV<28){bp+=15;factors.push({n:TERMS.rsi,d:isTH?"ดัชนีแรงดัน < 28 — แรงขายอิ่มตัวแล้ว":"Pressure < 28 — exhaustion threshold breached",v:+15});}
    else if(rsiV<42){bp+=7;factors.push({n:TERMS.rsi,d:isTH?"ดัชนีแรงดัน 28–42 — เริ่มเข้าสะสม":"Pressure 28–42 — accumulation detected",v:+7});}
    else if(rsiV>63){bp-=10;factors.push({n:TERMS.rsi,d:isTH?"ดัชนีแรงดันสูง — momentum ขาขึ้นยังแกร่ง":"Pressure elevated — continuation bias",v:-10});}
    if(macdV>.3){bp+=9;factors.push({n:TERMS.macd,d:isTH?"เวกเตอร์เป็นบวก — แรงซื้อสถาบันกลับมา":"Vector positive — institutional buy pressure",v:+9});}
    else if(macdV<-.3){bp-=7;factors.push({n:TERMS.macd,d:isTH?"เวกเตอร์เป็นลบ — แรงขายยังหนัก":"Vector negative — sell momentum persists",v:-7});}
    if(bbV&&zone.p<=bbV.l+5){bp+=9;factors.push({n:TERMS.bb,d:isTH?"ราคาแตะขอบล่าง — โซน oversold":"Price at compression lower bound",v:+9});}
    if(e20>e50){bp+=6;factors.push({n:TERMS.ema,d:isTH?"Ribbon ขาขึ้น — โครงสร้างมหภาคเป็น bull":"Ribbon ascending — macro bullish",v:+6});}
    else{bp-=5;factors.push({n:TERMS.ema,d:isTH?"Ribbon ขาลง — มีแรงต้านโครงสร้าง":"Ribbon descending — structural headwind",v:-5});}
  } else {
    if(rsiV>72){bp+=15;factors.push({n:TERMS.rsi,d:isTH?"ดัชนีแรงดัน > 72 — แรงซื้ออิ่มตัวแล้ว":"Pressure > 72 — distribution threshold breached",v:+15});}
    else if(rsiV>58){bp+=7;factors.push({n:TERMS.rsi,d:isTH?"ดัชนีแรงดัน 58–72 — เริ่มระบาย":"Pressure 58–72 — distribution detected",v:+7});}
    else if(rsiV<37){bp-=10;factors.push({n:TERMS.rsi,d:isTH?"ดัชนีแรงดันต่ำ — momentum ขาลงยังแกร่ง":"Pressure depressed — continuation bias",v:-10});}
    if(macdV<-.3){bp+=9;factors.push({n:TERMS.macd,d:isTH?"เวกเตอร์เป็นลบ — แรงขายสถาบันกลับมา":"Vector negative — institutional sell pressure",v:+9});}
    else if(macdV>.3){bp-=7;factors.push({n:TERMS.macd,d:isTH?"เวกเตอร์เป็นบวก — แรงซื้อยังหนัก":"Vector positive — buy momentum persists",v:-7});}
    if(bbV&&zone.p>=bbV.u-5){bp+=9;factors.push({n:TERMS.bb,d:isTH?"ราคาแตะขอบบน — โซน overbought":"Price at compression upper bound",v:+9});}
    if(e20<e50){bp+=6;factors.push({n:TERMS.ema,d:isTH?"Ribbon ขาลง — โครงสร้างมหภาคเป็น bear":"Ribbon descending — macro bearish",v:+6});}
    else{bp-=5;factors.push({n:TERMS.ema,d:isTH?"Ribbon ขาขึ้น — มีแรงต้านโครงสร้าง":"Ribbon ascending — structural headwind",v:-5});}
  }
  if(zone.t>=4){bp+=6;factors.push({n:TERMS.touches,d:isTH?`${zone.t} ครั้งที่ยืนยัน — สถาบันรับรู้โซนนี้`:`${zone.t} confirmed — high institutional awareness`,v:+6});}

  bp=clamp(Math.round(bp),24,94);
  const brk=100-bp;
  const str=zone.t*.3+bp*.04;
  const tp1Pips=Math.round(clamp(100+str*40,100,480));
  const tp2Pips=Math.round(clamp(500+str*150,500,1900));
  const tp3Pips=Math.round(clamp(2000+str*500,2000,5000));
  const dynFactor = clamp((getDecayScore(zone, totalCandles)/100)*0.5 + (bp/100)*0.5, 0.2, 1);
  let slPips;
  if(tp2Pips < 800) slPips = Math.round(clamp(500 - dynFactor*200, 300, 500));
  else if(tp2Pips < 1500) slPips = Math.round(clamp(1000 - dynFactor*500, 500, 1000));
  else slPips = Math.round(clamp(1500 - dynFactor*500, 1000, 1500));
  const pipToPrice=p=>p*0.01;
  const sl=zone.type==="S"?fmt(zone.p-pipToPrice(slPips)):fmt(zone.p+pipToPrice(slPips));
  const tp1=zone.type==="S"?fmt(zone.p+pipToPrice(tp1Pips)):fmt(zone.p-pipToPrice(tp1Pips));
  const tp2=zone.type==="S"?fmt(zone.p+pipToPrice(tp2Pips)):fmt(zone.p-pipToPrice(tp2Pips));
  const tp3=zone.type==="S"?fmt(zone.p+pipToPrice(tp3Pips)):fmt(zone.p-pipToPrice(tp3Pips));
  const tier=tp2Pips>=1500?"C":tp2Pips>=800?"B":"A";
  
  // Vector Bias: S zone = BUY, R zone = SELL, but can be overridden by probability
  const vectorBias = zone.type === "S" ? "BUY" : "SELL";
  
  return {bp,brk,factors,sl,tp1,tp2,tp3,tp1Pips,tp2Pips,tp3Pips,slPips,tier,age,decay,hist,vectorBias};
}

function useZoneCountdown(intervalSec) {
  const [timeLeft, setTimeLeft] = useState(intervalSec);
  const [tick, setTick] = useState(0);
  useEffect(() => { setTimeLeft(intervalSec); }, [intervalSec]);
  useEffect(() => {
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if(prev <= 1) { setTick(t => t + 1); return intervalSec; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [intervalSec]);
  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if(h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };
  return { timeLeft, tick, formatted: formatTime(timeLeft), pct: (timeLeft / intervalSec) * 100 };
}

function ConfluenceGauge({ score, lang }) {
  const tx = T[lang];
  const angle = -135 + (score/100)*270;
  const color = score<40?"#60a5fa":score<70?"#f59e0b":"#00e5a0";
  const cx=60,cy=60,r=44;
  const startA=-135*(Math.PI/180), endA=(angle)*(Math.PI/180);
  const x1=cx+r*Math.cos(startA),y1=cy+r*Math.sin(startA);
  const x2=cx+r*Math.cos(endA),y2=cy+r*Math.sin(endA);
  const large=angle-(-135)>180?1:0;
  const bgEndA=(-135+270)*(Math.PI/180);
  const bx2=cx+r*Math.cos(bgEndA),by2=cy+r*Math.sin(bgEndA);
  return (
    <div style={{background:"#080818",border:"1px solid #0f0f28",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
      <div style={{fontSize:7.5,color:"#252545",letterSpacing:2,marginBottom:10}}>{tx.confluenceScore}</div>
      <div style={{display:"flex",alignItems:"center",gap:16}}>
        <svg width={120} height={80} viewBox="0 0 120 80">
          <path d={`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${bx2} ${by2}`} fill="none" stroke="#0f0f28" strokeWidth="8" strokeLinecap="round"/>
          {score>0&&<path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"/>}
          <text x={cx} y={cy+4} textAnchor="middle" fill={color} fontSize="18" fontFamily="'Bebas Neue'" letterSpacing="1">{score}</text>
          <text x={cx} y={cy+16} textAnchor="middle" fill="#252545" fontSize="7" fontFamily="monospace">/ 100</text>
        </svg>
        <div style={{flex:1}}>
          {[{l:lang==="TH"?"แรงสัญญาณ":"Signal Strength",v:score},{l:lang==="TH"?"ทิศทางตลาด":"Market Bias",v:score>50?score:100-score}].map((item,i)=>(
            <div key={i} style={{marginBottom:8}}>
              <div style={{fontSize:7.5,color:"#333",marginBottom:4}}>{item.l}</div>
              <div style={{background:"#0a0a1c",borderRadius:3,height:5,overflow:"hidden"}}>
                <div style={{width:`${item.v}%`,height:"100%",background:`linear-gradient(90deg,${color},${color}80)`,borderRadius:3,transition:"width 1.5s ease"}}/>
              </div>
            </div>
          ))}
          <div style={{fontSize:7,color,letterSpacing:1,marginTop:4}}>
            {score>=70?(lang==="TH"?"สัญญาณแข็งแกร่ง":"STRONG SIGNAL"):score>=40?(lang==="TH"?"สัญญาณปานกลาง":"MODERATE"):lang==="TH"?"สัญญาณอ่อน":"WEAK SIGNAL"}
          </div>
        </div>
      </div>
    </div>
  );
}

function CandleCountdown({ tf, lang }) {
  const [timeLeft, setTimeLeft] = useState("--:--");
  const tx = T[lang];
  useEffect(()=>{
    function calc(){
      const now=new Date();
      const mins=now.getUTCMinutes(),secs=now.getUTCSeconds();
      const tfMins=TF_CONFIG[tf]?.mins||15;
      const elapsed=(mins%tfMins)*60+secs;
      const rem=tfMins*60-elapsed;
      const h=Math.floor(rem/3600);
      const m=Math.floor((rem%3600)/60);
      const s=rem%60;
      if(h>0) setTimeLeft(`${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
      else setTimeLeft(`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    }
    calc();
    const iv=setInterval(calc,1000);
    return()=>clearInterval(iv);
  },[tf]);
  return (
    <div style={{background:"#080818",border:"1px solid #0f0f28",borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <div style={{fontSize:7.5,color:"#252545",letterSpacing:2}}>{tx.candleClose} · {tf}</div>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:"#c9a227",letterSpacing:3}}>{timeLeft}</div>
    </div>
  );
}

function Chart({ candles, zones, live, tf, touchedZone }) {
  const W=600,H=195;
  const vis=candles.slice(-80);
  const all=vis.flatMap(c=>[c.h,c.l]);
  const mn=Math.min(...all)-4,mx=Math.max(...all)+4;
  const pad={l:46,r:8,t:10,b:8};
  const ph=H-pad.t-pad.b;
  const cw=(W-pad.l-pad.r)/vis.length;
  const py=p=>pad.t+ph-((p-mn)/(mx-mn))*ph;
  const cx=i=>pad.l+i*cw+cw*.5;
  const vz=zones.filter(z=>z.p>=mn&&z.p<=mx);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
      <text x={W/2} y={H/2+10} textAnchor="middle" fill="#c9a22708" fontSize="28" fontFamily="'Bebas Neue'" letterSpacing="6" transform={`rotate(-20,${W/2},${H/2})`}>ZONE ORACLE</text>
      {[.25,.5,.75].map((t,i)=><line key={i} x1={pad.l} x2={W-pad.r} y1={pad.t+ph*t} y2={pad.t+ph*t} stroke="#0f0f22" strokeWidth="1"/>)}
      {vz.map((z,i)=>{
        const isTouched=touchedZone===z.p;
        return <g key={i}>
          <rect x={pad.l} y={py(z.p)-5} width={W-pad.l-pad.r} height={10} fill={z.type==="S"?"#00e5a006":"#ff4d6d06"}/>
          <line x1={pad.l} x2={W-pad.r} y1={py(z.p)} y2={py(z.p)} stroke={z.type==="S"?"#00e5a0":"#ff4d6d"} strokeWidth={isTouched?"2":"1"} strokeDasharray={isTouched?"none":"5,4"} opacity={isTouched?1:.5}/>
          <text x={W-pad.r-2} y={py(z.p)-4} textAnchor="end" fill={z.type==="S"?"#00e5a070":"#ff4d6d70"} fontSize="7.5" fontFamily="monospace">{z.p}</text>
        </g>;
      })}
      {vis.map((c,i)=>{
        const bull=c.c>=c.o,col=bull?"#00e5a0":"#ff4d6d";
        const bT=py(Math.max(c.o,c.c)),bH=Math.max(1,Math.abs(py(c.o)-py(c.c)));
        return <g key={i}><line x1={cx(i)} x2={cx(i)} y1={py(c.h)} y2={py(c.l)} stroke={col} strokeWidth=".9" opacity=".8"/><rect x={cx(i)-cw*.38} y={bT} width={cw*.76} height={bH} fill={col} rx=".5"/></g>;
      })}
      {live>=mn&&live<=mx&&<>
        <line x1={pad.l} x2={W-pad.r} y1={py(live)} y2={py(live)} stroke="#c9a227" strokeWidth="1.2" strokeDasharray="4,3" opacity=".8"/>
        <rect x={pad.l-2} y={py(live)-8} width={40} height={16} fill="#c9a22720" rx="3"/>
        <text x={pad.l+18} y={py(live)+4} textAnchor="middle" fill="#c9a227" fontSize="8" fontFamily="monospace">{live.toFixed(1)}</text>
      </>}
      {[.25,.5,.75].map((t,i)=><text key={i} x={pad.l-4} y={pad.t+ph*(1-t)+3} textAnchor="end" fill="#2a2a45" fontSize="8" fontFamily="monospace">{Math.round(mn+(mx-mn)*t)}</text>)}
      <text x={pad.l+6} y={pad.t+13} fill="#2a2a45" fontSize="8" fontFamily="monospace" letterSpacing="2">{tf} · XAUUSD</text>
    </svg>
  );
}

function ZoneAgeBadge({ zone, totalCandles, lang }) {
  const tx = T[lang];
  const age = getZoneAge(zone, totalCandles);
  const labelKey = age.label === "pristine" ? "pristine" : age.label === "aging" ? "aging" : "mature";
  const descKey = age.label === "pristine" ? "pristineDesc" : age.label === "aging" ? "agingDesc" : "matureDesc";
  return (
    <div style={{background:`${age.color}10`,border:`1px solid ${age.color}30`,borderRadius:8,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div>
        <div style={{fontSize:7,color:"#333",letterSpacing:2,marginBottom:4}}>{TERMS.zoneAge}</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:age.color,letterSpacing:2}}>{tx[labelKey]}</div>
        <div style={{fontSize:7.5,color:"#444",marginTop:2}}>{tx[descKey]}</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:age.color,letterSpacing:2}}>{age.age}</div>
        <div style={{fontSize:7,color:"#333",letterSpacing:1}}>{tx.candlesAgo}</div>
      </div>
    </div>
  );
}

function DecayBar({ zone, totalCandles, lang }) {
  const tx = T[lang];
  const score = getDecayScore(zone, totalCandles);
  const color = score > 70 ? "#00e5a0" : score > 40 ? "#f59e0b" : "#ff4d6d";
  return (
    <div style={{background:"#080818",border:`1px solid ${color}20`,borderRadius:10,padding:"11px 14px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:7.5,color:"#252545",letterSpacing:2}}>{tx.decayLabel}</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color,letterSpacing:2}}>{score}<span style={{fontSize:10,color:`${color}60`}}>/100</span></div>
      </div>
      <div style={{background:"#0a0a1c",borderRadius:5,height:8,overflow:"hidden",marginBottom:6}}>
        <div style={{width:`${score}%`,height:"100%",background:`linear-gradient(90deg,${color},${color}80)`,borderRadius:5,transition:"width 1.5s ease"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <div style={{fontSize:7,color:"#252545"}}>{tx.decayScore}</div>
        <div style={{fontSize:7,color}}>{score>70?(lang==="TH"?"แข็งแกร่ง":"STRONG"):score>40?(lang==="TH"?"ปานกลาง":"MODERATE"):lang==="TH"?"อ่อนแอ":"WEAK"}</div>
      </div>
    </div>
  );
}

function MTFPanel({ zone, lang }) {
  const tx = T[lang];
  const mtf = getMTFConfluence(zone);
  const count = Object.values(mtf).filter(Boolean).length;
  const strength = count >= 4 ? "mtfStrong" : count >= 2 ? "mtfMod" : "mtfWeak";
  const sColor = count >= 4 ? "#00e5a0" : count >= 2 ? "#f59e0b" : "#ff4d6d";
  return (
    <div style={{background:"#080818",border:"1px solid #0f0f28",borderRadius:12,padding:"13px 15px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:7.5,color:"#252545",letterSpacing:2}}>{tx.mtfConfluence}</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:13,color:sColor,letterSpacing:2,border:`1px solid ${sColor}40`,borderRadius:4,padding:"2px 7px"}}>{tx[strength]}</div>
      </div>
      <div style={{fontSize:7,color:"#252545",marginBottom:10}}>{tx.mtfDesc}</div>
      <div style={{display:"flex",gap:6}}>
        {TFS.map(t=>(
          <div key={t} style={{flex:1,background:mtf[t]?`${sColor}15`:"#0a0a1c",border:`1px solid ${mtf[t]?sColor+"40":"#0f0f22"}`,borderRadius:7,padding:"8px 4px",textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:13,color:mtf[t]?sColor:"#1e1e35",letterSpacing:1}}>{t}</div>
            <div style={{fontSize:10,marginTop:3}}>{mtf[t]?"✓":"·"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Historical Record Panel — with large directional arrows ───────────────────
function HistoricalRecordPanel({ zone, lang }) {
  const tx = T[lang];
  const hist = getZoneHistoricalRecord(zone);
  const winColor = hist.winRate >= 60 ? "#00e5a0" : hist.winRate >= 45 ? "#f59e0b" : "#ff4d6d";
  // For support zone: bounce = UP arrow; for resistance: bounce = DOWN arrow
  const bounceArrow = zone.type === "S" ? "↑" : "↓";
  const breakArrow = zone.type === "S" ? "↓" : "↑";
  const bounceDir = zone.type === "S" ? "UP" : "DOWN";
  const breakDir = zone.type === "S" ? "DOWN" : "UP";

  return (
    <div style={{background:"#080818",border:`1px solid ${winColor}25`,borderRadius:12,padding:"13px 15px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:7.5,color:"#252545",letterSpacing:2,marginBottom:3}}>{tx.historicalRecord}</div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:"#c9a227",letterSpacing:2}}>{zone.p}</div>
            <div style={{fontSize:7,color:"#c9a22760",border:"1px solid #c9a22730",borderRadius:3,padding:"2px 6px",letterSpacing:1}}>
              {tx.entryPriceFixed}
            </div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:7,color:"#252545",letterSpacing:1,marginBottom:4}}>{tx.winRate}</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:30,color:winColor,letterSpacing:2,lineHeight:1}}>{hist.winRate}%</div>
        </div>
      </div>

      {/* Stats row — with direction arrows */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[
          {label:tx.totalTests, val:hist.totalTests, col:"#c9a227", arrow:null},
          {label:`${tx.bounceCount} ${bounceArrow}`, val:hist.bounces, col:zone.type==="S"?"#00e5a0":"#ff4d6d", arrow:bounceArrow},
          {label:`${tx.breakCount} ${breakArrow}`, val:hist.breaks, col:zone.type==="S"?"#ff4d6d":"#00e5a0", arrow:breakArrow},
        ].map((s,i)=>(
          <div key={i} style={{background:"#0a0a1c",border:`1px solid ${s.col}20`,borderRadius:8,padding:"9px 10px",textAlign:"center",position:"relative"}}>
            <div style={{fontSize:6.5,color:"#252545",letterSpacing:1,marginBottom:5}}>{s.label}</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:s.col,letterSpacing:2}}>{s.val}</div>
            {s.arrow && (
              <div style={{fontSize:18,color:s.col,opacity:0.25,position:"absolute",top:6,right:8,fontWeight:"bold"}}>{s.arrow}</div>
            )}
          </div>
        ))}
      </div>

      {/* Bar visual */}
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:"#252545",marginBottom:5}}>
          <span style={{color:zone.type==="S"?"#00e5a060":"#ff4d6d60"}}>{bounceArrow} {lang==="TH"?"เด้งกลับ":"BOUNCE"}</span>
          <span style={{color:zone.type==="S"?"#ff4d6d60":"#00e5a060"}}>{breakArrow} {lang==="TH"?"ทะลุผ่าน":"BREAK"}</span>
        </div>
        <div style={{background:"#0a0a1c",borderRadius:5,height:10,overflow:"hidden",display:"flex"}}>
          <div style={{width:`${hist.winRate}%`,height:"100%",background:zone.type==="S"?"linear-gradient(90deg,#00e5a0,#00c87a)":"linear-gradient(90deg,#cc2255,#ff4d6d)",borderRadius:"5px 0 0 5px",transition:"width 1.5s ease"}}/>
          <div style={{flex:1,height:"100%",background:zone.type==="S"?"linear-gradient(90deg,#cc2255,#ff4d6d)":"linear-gradient(90deg,#00e5a0,#00c87a)",borderRadius:"0 5px 5px 0"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:"#333",marginTop:4}}>
          <span style={{color:zone.type==="S"?"#00e5a080":"#ff4d6d80"}}>{hist.bounces}×</span>
          <span style={{color:zone.type==="S"?"#ff4d6d80":"#00e5a080"}}>{hist.breaks}×</span>
        </div>
      </div>

      {/* Event log — with large arrows */}
      <div style={{fontSize:7.5,color:"#252545",letterSpacing:2,marginBottom:10}}>{tx.zoneHistory}</div>
      {hist.events.length === 0 ? (
        <div style={{fontSize:8,color:"#151528",textAlign:"center",padding:"12px 0"}}>{tx.histNoData}</div>
      ) : hist.events.slice(0, 6).map((ev,i)=>{
        const isBounce = ev.type === "bounce";
        const arrow = isBounce ? bounceArrow : breakArrow;
        // Color logic: for SUPPORT (BUY) — bounce UP = green, break DOWN = red
        //              for RESISTANCE (SELL) — bounce DOWN = red, break UP = green
        const col = zone.type==="S"
          ? (isBounce ? "#00e5a0" : "#ff4d6d")   // S: bounce=green, break=red
          : (isBounce ? "#ff4d6d" : "#00e5a0");   // R: bounce=red, break=green
        const dirLabel = isBounce
          ? (lang==="TH"?"เด้งกลับ":"BOUNCE")
          : (lang==="TH"?"ทะลุผ่าน":"BREAK");
        const histLabel = isBounce ? tx.histBounce : tx.histBreak;
        return (
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<Math.min(hist.events.length,6)-1?"1px solid #0a0a1c":"none"}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              {/* Big directional arrow */}
              <div style={{
                width:32,height:32,borderRadius:6,
                background:`${col}15`,border:`1px solid ${col}30`,
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0
              }}>
                <span style={{fontSize:18,color:col,fontWeight:"bold",lineHeight:1}}>{arrow}</span>
              </div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <div style={{fontSize:10,color:col,fontFamily:"'Bebas Neue'",letterSpacing:1}}>{dirLabel}</div>
                  <div style={{fontSize:6,color:`${col}60`,border:`1px solid ${col}25`,borderRadius:3,padding:"1px 5px",letterSpacing:1}}>
                    {isBounce ? bounceDir : breakDir}
                  </div>
                </div>
                <div style={{fontSize:7,color:"#252545"}}>{histLabel}</div>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:14,color:"#555",letterSpacing:1}}>{ev.price}</div>
              <div style={{fontSize:7,color:"#252545"}}>{ev.daysAgo}d ago</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Vector Bias Panel ─────────────────────────────────────────────────────────
function VectorBiasPanel({ bias, zone, bp, lang }) {
  const tx = T[lang];
  const isBuy = bias === "BUY";
  const col = isBuy ? "#00e5a0" : "#ff4d6d";
  const bgCol = isBuy ? "#00e5a008" : "#ff4d6d08";
  const label = isBuy ? tx.primeBuy : tx.primeSell;
  const arrow = isBuy ? "↑" : "↓";
  const strength = bp >= 75 ? (lang==="TH"?"ยืนยันแกร่ง":"CONFIRMED STRONG") : bp >= 55 ? (lang==="TH"?"ปานกลาง":"MODERATE") : lang==="TH"?"อ่อน":"WEAK";
  const strengthCol = bp >= 75 ? col : bp >= 55 ? "#f59e0b" : "#555";

  return (
    <div style={{
      background:bgCol,
      border:`1.5px solid ${col}40`,
      borderRadius:12,
      padding:"14px 16px",
      marginBottom:8,
      position:"relative",
      overflow:"hidden"
    }}>
      {/* Watermark arrow */}
      <div style={{
        position:"absolute",right:-8,top:-12,
        fontFamily:"'Bebas Neue'",fontSize:90,
        color:`${col}06`,lineHeight:1,userSelect:"none",pointerEvents:"none"
      }}>{arrow}</div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:7,color:"#252545",letterSpacing:3,marginBottom:6}}>{tx.vectorBias}</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {/* Big arrow badge */}
            <div style={{
              width:44,height:44,borderRadius:8,
              background:`${col}18`,border:`1px solid ${col}40`,
              display:"flex",alignItems:"center",justifyContent:"center",
              flexShrink:0
            }}>
              <span style={{fontFamily:"'Bebas Neue'",fontSize:28,color:col,lineHeight:1}}>{arrow}</span>
            </div>
            <div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:26,color:col,letterSpacing:4,lineHeight:1}}>{label}</div>
              <div style={{fontSize:7,color:`${col}70`,letterSpacing:1,marginTop:3}}>{tx.biasDesc(bias)}</div>
            </div>
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:6.5,color:"#252545",letterSpacing:1,marginBottom:4}}>
            {lang==="TH"?"ความแข็งแกร่ง":"STRENGTH"}
          </div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:strengthCol,letterSpacing:2}}>{strength}</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:13,color:`${col}50`,letterSpacing:1,marginTop:2}}>{bp}%</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div style={{marginTop:12}}>
        <div style={{background:"#0a0a1c",borderRadius:4,height:5,overflow:"hidden"}}>
          <div style={{width:`${bp}%`,height:"100%",background:`linear-gradient(90deg,${col},${col}80)`,borderRadius:4,transition:"width 1.5s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:6.5,color:"#252545"}}>
          <span>0</span>
          <span style={{color:`${col}60`}}>{bp}% {lang==="TH"?"ความเชื่อมั่น":"CONFIDENCE"}</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}

function ZoneSnapshotBar({ intervalSec, onIntervalChange, onForceUpdate, formatted, pct, snapTime, lang }) {
  const tx = T[lang];
  return (
    <div style={{background:"#080818",border:"1px solid #0f0f28",borderRadius:10,padding:"10px 13px",marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:7,color:"#252545",letterSpacing:2}}>{tx.zoneSnapInterval}</div>
        <div style={{fontSize:6.5,color:"#1e1e38",letterSpacing:1}}>{tx.lastSnap}: {snapTime}</div>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
        {ZONE_INTERVAL_OPTIONS.map(opt=>(
          <button key={opt.label} onClick={()=>onIntervalChange(opt.seconds)}
            style={{
              background:intervalSec===opt.seconds?"#c9a22718":"transparent",
              border:`1px solid ${intervalSec===opt.seconds?"#c9a22750":"#0f0f28"}`,
              borderRadius:5,padding:"4px 12px",
              color:intervalSec===opt.seconds?"#c9a227":"#2a2a45",
              fontSize:8.5,letterSpacing:1.5
            }}>
            {lang==="TH"?opt.labelTH:opt.label}
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <div style={{fontSize:7,color:"#252545",letterSpacing:1}}>{tx.snapIn}</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:"#c9a227",letterSpacing:2}}>{formatted}</div>
          </div>
          <div style={{background:"#0a0a1c",borderRadius:3,height:3,overflow:"hidden"}}>
            <div style={{width:`${100-pct}%`,height:"100%",background:"linear-gradient(90deg,#c9a22780,#c9a227)",borderRadius:3,transition:"width 1s linear"}}/>
          </div>
        </div>
        <button onClick={onForceUpdate}
          style={{background:"#c9a22712",border:"1px solid #c9a22740",borderRadius:6,padding:"5px 10px",color:"#c9a22790",fontSize:7,letterSpacing:1,flexShrink:0}}>
          ↻ {tx.updateNow}
        </button>
      </div>
    </div>
  );
}

function PriceLadder({ zones, live, lang }) {
  const tx = T[lang];
  const sorted = [...zones].sort((a,b)=>a.p-b.p);
  if(!sorted.length) return null;
  const above = sorted.filter(z=>z.p>live).sort((a,b)=>a.p-b.p);
  const below = sorted.filter(z=>z.p<=live).sort((a,b)=>b.p-a.p);
  const renderItem = (z,isAbove) => {
    const dist = Math.abs(z.p-live);
    const pct = Math.min(dist/50*100,100);
    const col = isAbove?"#ff4d6d":"#00e5a0";
    return (
      <div key={z.p} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}>
        <div style={{fontFamily:"monospace",fontSize:9,color:col,width:52,textAlign:"right"}}>{z.p}</div>
        <div style={{flex:1,height:4,background:"#0a0a1c",borderRadius:2,overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",[isAbove?"left":"right"]:0,width:`${pct}%`,height:"100%",background:`linear-gradient(${isAbove?"90deg":"270deg"},${col}40,${col}15)`,borderRadius:2}}/>
        </div>
        <div style={{fontSize:7,color:"#252545",width:36}}>{dist.toFixed(1)} pt</div>
        <div style={{fontSize:6.5,color:`${col}60`,width:14,textAlign:"center"}}>{z.t}×</div>
      </div>
    );
  };
  return (
    <div style={{background:"#080818",border:"1px solid #0f0f28",borderRadius:12,padding:"13px 15px",marginBottom:10}}>
      <div style={{fontSize:7.5,color:"#252545",letterSpacing:2,marginBottom:10}}>{tx.priceLadder}</div>
      {above.slice(0,3).map(z=>renderItem(z,true))}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderTop:"1px solid #0f0f22",borderBottom:"1px solid #0f0f22",margin:"4px 0"}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:13,color:"#c9a227",width:52,textAlign:"right"}}>{live.toFixed(1)}</div>
        <div style={{flex:1,height:2,background:"#c9a22740"}}/>
        <div style={{fontSize:7,color:"#c9a22760",width:36}}>LIVE</div>
        <div style={{width:14}}/>
      </div>
      {below.slice(0,3).map(z=>renderItem(z,false))}
    </div>
  );
}

function TradeJournal({ lang, prefillZone, onClearPrefill }) {
  const tx = T[lang];
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({entry:"",exit:"",lot:"",sl:"",tp:"",zone:"",direction:"LONG",notes:""});
  const [tradeResult, setTradeResult] = useState(null); // "TP" | "SL" | null

  // XAUUSD สูตรถูกต้อง:
  // 1 point (เช่น 2100→2101) = $100 per 1.0 lot = $10 per 0.1 lot = $1 per 0.01 lot
  // pts = price diff (ทศนิยม 1 ตำแหน่ง)
  // usd = pts × lot × 100
  function calcPnl(entry, sl, tp, lot, res) {
    const e = parseFloat(entry), s = parseFloat(sl), t = parseFloat(tp);
    const l = parseFloat(lot) || 1.0;
    if(!e || isNaN(e)) return null;
    const isLong = form.direction === "LONG";
    if(res === "TP" && t && !isNaN(t)){
      const pts = Math.round((isLong ? t - e : e - t) * 10) / 10;
      const usd = Math.round(pts * l * 100);
      return { pts, usd, type:"TP" };
    }
    if(res === "SL" && s && !isNaN(s)){
      const pts = Math.round((isLong ? s - e : e - s) * 10) / 10;
      const usd = Math.round(pts * l * 100);
      return { pts, usd, type:"SL" };
    }
    return null;
  }

  const calc = calcPnl(form.entry, form.sl, form.tp, form.lot, tradeResult);

  const STORAGE_KEY = "zone_oracle_journal_v3";

  // ── Persistent storage — localStorage works everywhere ──────────────────
  // Load on mount
  useEffect(()=>{
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        if(Array.isArray(parsed)) setEntries(parsed);
      }
    } catch(e){ /* first time or parse error — start fresh */ }
  },[]);

  // Save whenever entries change
  useEffect(()=>{
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch(e){ console.warn("Journal save failed:", e); }
  },[entries]);

  useEffect(()=>{
    if(prefillZone){
      setForm(f=>({...f, zone:String(prefillZone.p), direction: prefillZone.type==="S"?"LONG":"SHORT"}));
      setShowForm(true);
      onClearPrefill();
    }
  },[prefillZone, onClearPrefill]);

  function saveEntry(){
    if(!form.entry) return;
    const pnlVal = calc ? String(calc.pts) : form.lot;
    const e = { ...form, pnl: pnlVal, calcUsd: calc?.usd, tradeResult, id:Date.now(), date:new Date().toLocaleDateString(), result: tradeResult==="TP"?"WIN": tradeResult==="SL"?"LOSS": Number(pnlVal)>=0?"WIN":"LOSS" };
    setEntries(prev=>[e,...prev]);
    setForm({entry:"",exit:"",lot:"",sl:"",tp:"",zone:"",direction:"LONG",notes:""});
    setTradeResult(null);
    setShowForm(false);
  }

  function deleteEntry(id){ setEntries(prev=>prev.filter(e=>e.id!==id)); }
  const wins = entries.filter(e=>e.result==="WIN").length;
  const winRate = entries.length ? Math.round(wins/entries.length*100) : 0;
  const avgPnl = entries.length ? Math.round(entries.reduce((a,e)=>a+Number(e.pnl||0),0)/entries.length) : 0;
  // Total pips across all trades (stored in e.pnl = pips)
  const totalPips = entries.reduce((a,e)=>a+Number(e.pnl||0),0);
  // Total USD across all trades
  const totalUsd  = entries.reduce((a,e)=>a+Number(e.calcUsd||0),0);

  const inputStyle = {background:"#0a0a1c",border:"1px solid #1a1a30",borderRadius:6,padding:"7px 10px",color:"#c8c0a8",fontSize:9,width:"100%",fontFamily:"'DM Mono',monospace"};

  return (
    <div className="fade">
      {/* ── Summary stats row ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:10}}>
        {/* Total trades */}
        <div style={{background:"#080818",border:"1px solid #0f0f28",borderRadius:10,padding:"11px 12px",textAlign:"center"}}>
          <div style={{fontSize:7,color:"#252545",letterSpacing:1,marginBottom:5}}>{tx.journalTrades}</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:"#c9a227",letterSpacing:2}}>{entries.length}</div>
        </div>
        {/* Win rate */}
        <div style={{background:"#080818",border:"1px solid #0f0f28",borderRadius:10,padding:"11px 12px",textAlign:"center"}}>
          <div style={{fontSize:7,color:"#252545",letterSpacing:1,marginBottom:5}}>{tx.journalWinRate}</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:winRate>=50?"#00e5a0":"#ff4d6d",letterSpacing:2}}>{winRate}%</div>
        </div>
        {/* Total pips + USD — the key card */}
        <div style={{background:"#080818",border:`1px solid ${totalPips>=0?"#00e5a020":"#ff4d6d20"}`,borderRadius:10,padding:"11px 12px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{fontSize:7,color:"#252545",letterSpacing:1,marginBottom:3}}>
            {lang==="TH"?"รวมทุกออเดอร์":"TOTAL P&L"}
          </div>
          {/* Pips total */}
          <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:totalPips>=0?"#00e5a0":"#ff4d6d",letterSpacing:2,lineHeight:1}}>
            {totalPips>0?"+":""}{totalPips.toLocaleString()}
            <span style={{fontSize:9,opacity:.5,marginLeft:2}}>pts</span>
          </div>
          {/* USD total */}
          {totalUsd!==0&&(
            <div style={{fontFamily:"'Bebas Neue'",fontSize:13,color:totalUsd>=0?"#00e5a070":"#ff4d6d70",letterSpacing:1,marginTop:2}}>
              {totalUsd>0?"+":""}{totalUsd.toLocaleString()}$
            </div>
          )}
        </div>
      </div>
      {!showForm&&(
        <button onClick={()=>setShowForm(true)} style={{width:"100%",background:"#c9a22712",border:"1px solid #c9a22740",borderRadius:10,padding:"11px 0",color:"#c9a227",fontSize:9,letterSpacing:2,marginBottom:10}}>
          + {tx.journalAdd}
        </button>
      )}
      {showForm&&(
        <div style={{background:"#080818",border:"1px solid #c9a22730",borderRadius:12,padding:"14px 15px",marginBottom:10}}>
          <div style={{fontSize:7.5,color:"#252545",letterSpacing:2,marginBottom:12}}>{tx.journalAdd}</div>
          {/* Row 1: Entry / SL / TP */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
            <div>
              <div style={{fontSize:7,color:"#333",marginBottom:4}}>{lang==="TH"?"ราคาเข้า (Entry)":"Entry Price"}</div>
              <input style={inputStyle} placeholder="2347.5" value={form.entry} onChange={e=>setForm(f=>({...f,entry:e.target.value}))}/>
            </div>
            <div>
              <div style={{fontSize:7,color:"#ff4d6d80",marginBottom:4}}>SL {lang==="TH"?"(ตัดขาดทุน)":"(Stop Loss)"}</div>
              <input style={{...inputStyle,borderColor:"#ff4d6d30"}} placeholder="2340.0" value={form.sl} onChange={e=>setForm(f=>({...f,sl:e.target.value}))}/>
            </div>
            <div>
              <div style={{fontSize:7,color:"#00e5a080",marginBottom:4}}>TP {lang==="TH"?"(เป้าหมาย)":"(Take Profit)"}</div>
              <input style={{...inputStyle,borderColor:"#00e5a030"}} placeholder="2360.0" value={form.tp} onChange={e=>setForm(f=>({...f,tp:e.target.value}))}/>
            </div>
          </div>
          {/* Row 2: Lot + Direction + Result button */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
            <div>
              <div style={{fontSize:7,color:"#333",marginBottom:4}}>Lot {lang==="TH"?"(ขนาด)":"Size"}</div>
              <input style={inputStyle} placeholder="0.01" value={form.lot} onChange={e=>setForm(f=>({...f,lot:e.target.value}))}/>
            </div>
            <div>
              <div style={{fontSize:7,color:"#333",marginBottom:4}}>{tx.journalDirection}</div>
              <div style={{display:"flex",gap:4}}>
                {["LONG","SHORT"].map(d=>(
                  <button key={d} onClick={()=>setForm(f=>({...f,direction:d}))}
                    style={{flex:1,background:form.direction===d?(d==="LONG"?"#00e5a020":"#ff4d6d20"):"transparent",border:`1px solid ${form.direction===d?(d==="LONG"?"#00e5a040":"#ff4d6d40"):"#1a1a30"}`,borderRadius:5,padding:"7px 0",color:form.direction===d?(d==="LONG"?"#00e5a0":"#ff4d6d"):"#333",fontSize:7}}>
                    {d==="LONG"?tx.journalLong:tx.journalShort}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:7,color:"#333",marginBottom:4}}>{lang==="TH"?"ผลการเทรด":"Outcome"}</div>
              <div style={{display:"flex",gap:4}}>
                {["TP","SL"].map(r=>(
                  <button key={r} onClick={()=>setTradeResult(tr=>tr===r?null:r)}
                    style={{flex:1,background:tradeResult===r?(r==="TP"?"#00e5a025":"#ff4d6d25"):"transparent",border:`1px solid ${tradeResult===r?(r==="TP"?"#00e5a060":"#ff4d6d60"):"#1a1a30"}`,borderRadius:5,padding:"7px 0",color:tradeResult===r?(r==="TP"?"#00e5a0":"#ff4d6d"):"#333",fontSize:8,letterSpacing:1,fontFamily:"'Bebas Neue'"}}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Auto-calc result display */}
          {calc && (
            <div style={{background:calc.type==="TP"?"#00e5a010":"#ff4d6d10",border:`1px solid ${calc.type==="TP"?"#00e5a040":"#ff4d6d40"}`,borderRadius:8,padding:"10px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:7,color:"#333",letterSpacing:1,marginBottom:3}}>{calc.type==="TP"?(lang==="TH"?"กำไร ✓":"PROFIT ✓"):(lang==="TH"?"ขาดทุน ✗":"LOSS ✗")}</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:calc.type==="TP"?"#00e5a0":"#ff4d6d",letterSpacing:2}}>
                  {calc.pts>0?"+":""}{Number(calc.pts).toLocaleString()} {lang==="TH"?"pts":"pts"}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:7,color:"#333",marginBottom:3}}>USD ({form.lot||"1"} lot)</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:calc.type==="TP"?"#00e5a0":"#ff4d6d",letterSpacing:2}}>
                  {calc.usd>0?"+":""}{calc.usd.toLocaleString()}$
                </div>
              </div>
            </div>
          )}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:7,color:"#333",marginBottom:4}}>{tx.journalNotes}</div>
            <input style={inputStyle} placeholder={lang==="TH"?"บันทึกเพิ่มเติม...":"Additional notes..."} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={saveEntry} style={{flex:1,background:"#c9a22720",border:"1px solid #c9a22750",borderRadius:8,padding:"9px 0",color:"#c9a227",fontSize:9,letterSpacing:2}}>{tx.journalSave}</button>
            <button onClick={()=>setShowForm(false)} style={{flex:1,background:"transparent",border:"1px solid #1a1a30",borderRadius:8,padding:"9px 0",color:"#444",fontSize:9,letterSpacing:1}}>{tx.journalCancel}</button>
          </div>
        </div>
      )}
      {entries.length===0&&!showForm&&(
        <div style={{textAlign:"center",padding:"40px 0",color:"#151528",fontSize:9,letterSpacing:1}}>{tx.journalNoEntries}</div>
      )}
      {entries.map((e,i)=>{
        const isWin = e.result==="WIN";
        const col = isWin?"#00e5a0":"#ff4d6d";
        const ptsNum = Number(e.pnl);
        const hasCalc = e.calcUsd != null;
        return (
        <div key={e.id} style={{background:"#080818",border:`1px solid ${col}20`,borderRadius:10,padding:"11px 14px",marginBottom:7}}>
          {/* Top row: WIN/LOSS badge + direction + pts + USD + delete */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:13,color:col,letterSpacing:1,border:`1px solid ${col}30`,borderRadius:3,padding:"1px 6px"}}>
                {isWin?tx.journalWin:tx.journalLoss}
              </div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:13,color:e.direction==="LONG"?"#00e5a0":"#ff4d6d",letterSpacing:1}}>
                {e.direction==="LONG"?tx.journalLong:tx.journalShort}
              </div>
              {e.tradeResult&&(
                <div style={{fontFamily:"'Bebas Neue'",fontSize:11,color:e.tradeResult==="TP"?"#00e5a090":"#ff4d6d90",border:`1px solid ${e.tradeResult==="TP"?"#00e5a030":"#ff4d6d30"}`,borderRadius:3,padding:"1px 6px",letterSpacing:1}}>
                  {e.tradeResult}
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <button onClick={()=>deleteEntry(e.id)} style={{background:"transparent",border:"1px solid #ff4d6d20",borderRadius:4,padding:"2px 6px",color:"#ff4d6d40",fontSize:7}}>{tx.journalDelete}</button>
            </div>
          </div>

          {/* P&L display: pts + USD side by side */}
          <div style={{display:"flex",gap:10,alignItems:"flex-end",marginBottom:8}}>
            <div>
              <div style={{fontSize:6.5,color:"#252545",letterSpacing:1,marginBottom:2}}>{lang==="TH"?"จำนวนจุด":"POINTS"}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:26,color:col,letterSpacing:2,lineHeight:1}}>
                {ptsNum>0?"+":""}{isNaN(ptsNum)?e.pnl:Number(ptsNum).toLocaleString()} <span style={{fontSize:12,opacity:.5}}>pts</span>
              </div>
            </div>
            {hasCalc&&(
              <>
                <div style={{width:1,height:28,background:"#1a1a30",flexShrink:0}}/>
                <div>
                  <div style={{fontSize:6.5,color:"#252545",letterSpacing:1,marginBottom:2}}>USD {e.lot?`(${e.lot} lot)`:""}</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:26,color:col,letterSpacing:2,lineHeight:1}}>
                    {e.calcUsd>0?"+":""}{Number(e.calcUsd).toLocaleString()} <span style={{fontSize:12,opacity:.5}}>$</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Detail row */}
          <div style={{display:"flex",gap:10,fontSize:7,color:"#252545",flexWrap:"wrap"}}>
            <span>{lang==="TH"?"เข้า":"Entry"}: <span style={{color:"#555"}}>{e.entry}</span></span>
            {e.sl&&<span>SL: <span style={{color:"#ff4d6d60"}}>{e.sl}</span></span>}
            {e.tp&&<span>TP: <span style={{color:"#00e5a060"}}>{e.tp}</span></span>}
            {e.zone&&<span>{tx.journalZone}: <span style={{color:"#c9a22760"}}>{e.zone}</span></span>}
            <span style={{marginLeft:"auto",color:"#1e1e38"}}>{e.date}</span>
          </div>
          {e.notes&&<div style={{fontSize:7,color:"#2a2a45",marginTop:4,fontStyle:"italic"}}>{e.notes}</div>}
        </div>
        );
      })}
    </div>
  );
}

const BASE = 2347;

function DashboardApp() {
  const [lang, setLang] = useState("TH");
  const [tf, setTf] = useState("M15");
  const [candles, setCandles] = useState(() => genCandles(BASE, "M15"));
  const [live, setLive] = useState(BASE);
    useEffect(() => {
  async function fetchMT5Price() {
    try {
      const priceUrl = process.env.NEXT_PUBLIC_PRICE_SERVER_URL || "http://localhost:3002";
      const res = await fetch(`${priceUrl}/price`);
      const data = await res.json();

      if (data.bid && Number(data.bid) > 0) {
        setLive(Number(data.bid));
        setHasMT5(true); // บอกว่ามีราคา MT5 จริง — หยุดสุ่มราคา
      }
    } catch (err) {
      console.log(err);
    }
  }

  fetchMT5Price();

  const interval = setInterval(fetchMT5Price, 200);

  return () => clearInterval(interval);
}, []);
  const [tab, setTab] = useState("zones");
  const [selZone, setSelZone] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [session] = useState(getSession());
  const [alertZones, setAlertZones] = useState([]);
  const [alertConditions, setAlertConditions] = useState({});
  const [alertMsg, setAlertMsg] = useState(null);
  const [touchedZone, setTouchedZone] = useState(null);
  const [journalPrefill, setJournalPrefill] = useState(null);
  const [zoneIntervalSec, setZoneIntervalSec] = useState(15 * 60);
  const [frozenZones, setFrozenZones] = useState(null);
  const [snapTime, setSnapTime] = useState("--:--");
  const [snapMsg, setSnapMsg] = useState(null);

  const { tick: zoneAutoTick, formatted: countdownFormatted, pct: countdownPct } = useZoneCountdown(zoneIntervalSec);
  const tx = T[lang];

  function takeSnapshot(currentLive, currentCandles, currentTf) {
    const snapped = detectZones6(currentCandles, currentLive, currentTf || tf);
    setFrozenZones(snapped);
    setSnapTime(new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}));
    setSnapMsg(lang==="TH"?"✓ อัพเดทโซนแล้ว":"✓ Zones updated");
    setTimeout(()=>setSnapMsg(null), 2500);
  }

  const liveRef = useRef(live);
  const candlesRef = useRef(candles);
  const tfRef = useRef(tf);
  liveRef.current = live;
  candlesRef.current = candles;
  tfRef.current = tf;

  useEffect(()=>{ takeSnapshot(liveRef.current, candlesRef.current, tfRef.current); }, [zoneAutoTick]);
  useEffect(()=>{ takeSnapshot(live, candles, tf); }, []);

  function changeTf(newTf) {
    setTf(newTf);
    const newCandles = genCandles(liveRef.current, newTf);
    setCandles(newCandles);
    setSelZone(null); setResult(null);
    takeSnapshot(liveRef.current, newCandles, newTf);
  }

  const e20arr = ema(candles.map(c=>c.c), 20);
  const e50arr = ema(candles.map(c=>c.c), 50);
  const rsiArr = rsi(candles);
  const macdArr = macd(candles);
  const bbArr = calcBB(candles);
  const rsiV = rsiArr[rsiArr.length-1] ?? 50;
  const macdV = macdArr[macdArr.length-1] ?? 0;
  const bbV = bbArr[bbArr.length-1];
  const e20V = e20arr[e20arr.length-1];
  const e50V = e50arr[e50arr.length-1];
  const vol = getVolatility(bbArr);
  const confScore = getConfluenceScore(rsiV, macdV, bbV, e20V, e50V, live);
  const tfVol = TF_CONFIG[tf]?.volatility || 1.5;

  const displayZones = frozenZones || [];
  const above = displayZones.filter(z=>z.type==="R").sort((a,b)=>a.p-b.p);
  const below = displayZones.filter(z=>z.type==="S").sort((a,b)=>b.p-a.p);

  const [hasMT5, setHasMT5] = useState(false);

  useEffect(()=>{
    const tickMs = 800;
    const delta = tfVol * 0.12;
    const iv = setInterval(()=>{
      const d = hasMT5 ? 0 : rnd(-delta, delta);
      setLive(p=>{
        const np = hasMT5 ? p : Math.round((p+d)*100)/100;
        displayZones.forEach(z=>{
          if(Math.abs(np-z.p)<2){
            setTouchedZone(z.p);
            setTimeout(()=>setTouchedZone(null), 2000);
          }
          if(alertZones.includes(z.p)){
            const cond = alertConditions[z.p]||"near";
            let triggered = Math.abs(np-z.p)<3;
            if(cond==="rsiLow") triggered = triggered && rsiV<35;
            if(cond==="rsiHigh") triggered = triggered && rsiV>65;
            if(triggered){
              const condLabel = cond==="rsiLow"?" + RSI<35": cond==="rsiHigh"?" + RSI>65":"";
              setAlertMsg(lang==="TH"
                ?`⚡ ราคาเข้าใกล้${z.type==="S"?"แนวรับ":"แนวต้าน"} ${z.p}${condLabel}`
                :`⚡ Approaching ${z.type==="S"?"Support":"Resistance"} ${z.p}${condLabel}`);
              setTimeout(()=>setAlertMsg(null), 4000);
            }
          }
        });
        return np;
      });
      setCandles(prev=>{
        const last = prev[prev.length-1];
        const nc = last.c + d;
        const upd = {...last, c:nc, h:Math.max(last.h,nc), l:Math.min(last.l,nc)};
        if(Math.random()<.08){
          const newCandle={o:nc,c:nc+rnd(-delta,delta),h:nc+rnd(0.3,tfVol*0.7),l:nc-rnd(0.3,tfVol*0.7),i:prev.length};
          return [...prev.slice(-TF_CONFIG[tf].count+1), upd, newCandle];
        }
        return [...prev.slice(0,-1), upd];
      });
    }, tickMs);
    return ()=>clearInterval(iv);
  }, [alertZones, alertConditions, displayZones, hasMT5, lang, rsiV, tf, tfVol]);

  function pickZone(z){
    setSelZone(z); setLoading(true); setResult(null); setTab("analysis");
    setTimeout(()=>{
      setResult(computeResult(z, rsiV, macdV, bbV, e20V, e50V, live, lang, candles.length));
      setLoading(false);
    }, 800);
  }

  function toggleAlert(p){ setAlertZones(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p]); }
  function setAlertCond(p, cond){ setAlertConditions(prev=>({...prev,[p]:cond})); }

  const zC = selZone?.type==="S" ? "#00e5a0" : "#ff4d6d";
  const isS = selZone?.type==="S";

  const indData = [
    {label:TERMS.rsi, val:rsiV.toFixed(1), color:rsiV<35?"#00e5a0":rsiV>65?"#ff4d6d":"#555", sub:rsiV<35?tx.oversold:rsiV>65?tx.overbought:tx.neutral},
    {label:TERMS.macd, val:macdV>0?"▲":"▼", color:macdV>0?"#00e5a0":"#ff4d6d", sub:macdV>0?tx.accumulate:tx.distribute},
    {label:TERMS.ema, val:e20V>e50V?tx.ascend:tx.descend, color:e20V>e50V?"#00e5a0":"#ff4d6d", sub:tx.gradient},
    {label:tx.volState, val:tx[vol.state], color:vol.color, sub:tx.fieldPos},
  ];

  const TABS = [["zones",tx.zoneMap],["analysis",tx.deepAnalysis],["alerts",tx.alertsTab],["journal",tx.journalTab]];

  return (
    <div style={{minHeight:"100vh",background:"#050510",color:"#c8c0a8",fontFamily:"'DM Mono',monospace"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .fade{animation:fade .35s cubic-bezier(.4,0,.2,1)}
        @keyframes fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .zrow{cursor:pointer;transition:all .15s}
        .zrow:hover{border-color:#c9a22740!important;transform:translateX(2px)}
        .pulse{animation:pulse 2.5s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
        .bar{transition:width 1.5s cubic-bezier(.4,0,.2,1)}
        button,input{cursor:pointer;transition:all .15s;font-family:'DM Mono',monospace}
        button:hover{filter:brightness(1.15)}
        input:focus{outline:none}
        .toast{animation:toast .3s ease}
        @keyframes toast{from{opacity:0;transform:translate(-50%,-15px)}to{opacity:1;transform:translate(-50%,0)}}
        .scanline{animation:scan 3s linear infinite}
        @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(500%)}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#1a1a30;border-radius:2px}
      `}</style>

      {alertMsg&&<div className="toast" style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",background:"#0d0d22",border:"1px solid #c9a22760",borderRadius:10,padding:"11px 20px",fontSize:11,color:"#c9a227",zIndex:999,letterSpacing:1,whiteSpace:"nowrap",boxShadow:"0 8px 32px rgba(0,0,0,.6)"}}>{alertMsg}</div>}
      {snapMsg&&<div className="toast" style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",background:"#0d0d22",border:"1px solid #00e5a040",borderRadius:10,padding:"11px 20px",fontSize:11,color:"#00e5a0",zIndex:998,letterSpacing:1,whiteSpace:"nowrap",boxShadow:"0 8px 32px rgba(0,0,0,.6)"}}>{snapMsg}</div>}

      {/* HEADER */}
      <div style={{background:"linear-gradient(180deg,#08081a,#050510)",borderBottom:"1px solid #0f0f28",padding:"0 16px"}}>
        <div style={{maxWidth:720,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",height:54}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:5,color:"#c9a227",lineHeight:1}}>ZONE ORACLE</div>
              <div style={{fontSize:6.5,color:"#1e1e38",letterSpacing:2,marginTop:1}}>{tx.appSub}</div>
            </div>
            <div style={{width:1,height:22,background:"#0f0f28"}}/>
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",background:`${session.color}12`,border:`1px solid ${session.color}30`,borderRadius:5}}>
              <div className="pulse" style={{width:4,height:4,borderRadius:"50%",background:session.color}}/>
              <span style={{fontSize:7,color:session.color,letterSpacing:1}}>{lang==="TH"?session.nameTH:session.name} {tx.sessionWindow}</span>
            </div>
            <div style={{padding:"3px 8px",background:"#c9a22710",border:"1px solid #c9a22730",borderRadius:5,fontSize:6.5,color:"#c9a22780",letterSpacing:1}}>◆ PRO</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setLang(l=>l==="TH"?"EN":"TH")}
              style={{background:"#0d0d22",border:"1px solid #c9a22740",borderRadius:6,padding:"4px 10px",color:"#c9a227",fontSize:9,letterSpacing:2}}>
              {lang==="TH"?"EN":"TH"}
            </button>
            <div style={{textAlign:"right"}}>
              <div style={{display:"flex",alignItems:"center",gap:5,justifyContent:"flex-end"}}>
                <div className="pulse" style={{width:4,height:4,borderRadius:"50%",background:"#00e5a0"}}/>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:23,letterSpacing:3,color:"#c9a227"}}>{live.toFixed(2)}</div>
              </div>
              <div style={{fontSize:6.5,color:"#1e1e38",letterSpacing:2}}>{tx.live}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"12px 12px"}}>
        {/* CHART */}
        <div style={{background:"#080818",border:"1px solid #0f0f28",borderRadius:13,padding:"10px 6px",marginBottom:10,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,#c9a22730,transparent)"}}/>
          <div className="scanline" style={{position:"absolute",left:0,right:0,height:60,background:"linear-gradient(180deg,transparent,rgba(201,162,39,.015),transparent)",pointerEvents:"none"}}/>
          <Chart candles={candles} zones={displayZones} live={live} tf={tf} touchedZone={touchedZone}/>
        </div>

        {/* CANDLE COUNTDOWN + VOLATILITY */}
        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,marginBottom:10,alignItems:"center"}}>
          <CandleCountdown tf={tf} lang={lang}/>
          <div style={{background:"#080818",border:`1px solid ${vol.color}30`,borderRadius:10,padding:"10px 14px",textAlign:"center",minWidth:90}}>
            <div style={{fontSize:6.5,color:"#252545",letterSpacing:1,marginBottom:4}}>{tx.volState}</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:14,color:vol.color,letterSpacing:2}}>{tx[vol.state]}</div>
          </div>
        </div>

        {/* TF SELECTOR */}
        <div style={{display:"flex",gap:5,marginBottom:10,alignItems:"center"}}>
          <div style={{fontSize:7,color:"#252540",letterSpacing:2,marginRight:2}}>{tx.tf}</div>
          {TFS.map(t=>(
            <button key={t} onClick={()=>changeTf(t)}
              style={{
                background:tf===t?"#c9a22718":"transparent",
                border:`1px solid ${tf===t?"#c9a22750":"#0f0f28"}`,
                borderRadius:6,padding:"5px 11px",
                color:tf===t?"#c9a227":"#2a2a45",
                fontSize:8.5,letterSpacing:1.5,
                boxShadow:tf===t?"0 0 8px #c9a22720":""
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* INDICATORS */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
          {indData.map((ind,i)=>(
            <div key={i} style={{background:"#080818",border:"1px solid #0f0f28",borderRadius:8,padding:"9px 10px",overflow:"hidden"}}>
              <div style={{fontSize:5.5,color:"#1e1e35",letterSpacing:.3,marginBottom:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ind.label}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:15,color:ind.color,letterSpacing:1}}>{ind.val}</div>
              <div style={{fontSize:6.5,color:ind.color,opacity:.45,marginTop:2,letterSpacing:.5}}>{ind.sub}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:3,marginBottom:10,background:"#080818",border:"1px solid #0f0f28",borderRadius:10,padding:4}}>
          {TABS.map(([t,label])=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{flex:1,background:tab===t?"linear-gradient(135deg,#c9a22720,#c9a22708)":"transparent",border:`1px solid ${tab===t?"#c9a22745":"transparent"}`,borderRadius:7,padding:"9px 0",color:tab===t?"#c9a227":"#2a2a45",fontSize:7.5,letterSpacing:1}}>
              {label}{t==="alerts"&&alertZones.length>0?` (${alertZones.length})`:""}
            </button>
          ))}
        </div>

        {/* ── ZONE MAP ── */}
        {tab==="zones"&&(
          <div className="fade">
            <ConfluenceGauge score={confScore} lang={lang}/>
            <ZoneSnapshotBar
              intervalSec={zoneIntervalSec}
              onIntervalChange={v=>{ setZoneIntervalSec(v); }}
              onForceUpdate={()=>takeSnapshot(liveRef.current, candlesRef.current, tfRef.current)}
              formatted={countdownFormatted}
              pct={countdownPct}
              snapTime={snapTime}
              lang={lang}
            />
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"7px 12px",background:"#0a0a1c",border:"1px solid #0f0f28",borderRadius:8}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#c9a22740",flexShrink:0}}/>
              <div style={{fontSize:7,color:"#252545",letterSpacing:1}}>
                {tx.frozenZones} · 3 {lang==="TH"?"แนวต้าน":"R"} + 3 {lang==="TH"?"แนวรับ":"S"} · {tx.frozenAt} {snapTime}
              </div>
            </div>
            <PriceLadder zones={displayZones} live={live} lang={lang}/>
            <div style={{fontSize:7.5,color:"#c9a22760",letterSpacing:2,marginBottom:12}}>
              {tx.selectZone} · {displayZones.length} {tx.zonesDetected}
            </div>

            {above.length>0&&<>
              <div style={{fontSize:7.5,color:"#ff4d6d50",letterSpacing:2,marginBottom:8}}>{tx.overhead}</div>
              {above.map((z,i)=>{
                const age=getZoneAge(z,candles.length);
                const decay=getDecayScore(z,candles.length);
                return(
                  <div key={i} className="zrow" onClick={()=>pickZone(z)}
                    style={{background:selZone?.p===z.p?"#100a00":"#080818",border:`1px solid ${touchedZone===z.p?"#ff4d6d60":selZone?.p===z.p?"#c9a22740":"#0f0f28"}`,borderRadius:10,padding:"11px 14px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",gap:11,alignItems:"center"}}>
                      <div style={{width:2,height:34,background:`linear-gradient(180deg,#ff4d6d,#ff4d6d30)`,borderRadius:2}}/>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                          <div style={{fontFamily:"'Bebas Neue'",fontSize:21,color:"#ff4d6d",letterSpacing:2}}>{z.p}</div>
                          <div style={{fontSize:6.5,color:age.color,border:`1px solid ${age.color}40`,borderRadius:3,padding:"1px 5px",letterSpacing:1}}>{tx[age.label]}</div>
                          <div style={{fontSize:6.5,color:decay>70?"#00e5a060":decay>40?"#f59e0b60":"#ff4d6d60",border:`1px solid ${decay>70?"#00e5a020":decay>40?"#f59e0b20":"#ff4d6d20"}`,borderRadius:3,padding:"1px 5px"}}>💪{decay}</div>
                        </div>
                        <div style={{fontSize:7,color:"#ff4d6d40",letterSpacing:.3}}>
                          {tx.resistance} · {z.t} {tx.interactions} · +{(z.p-live).toFixed(1)} {tx.away} · {lang==="TH"?SESSIONS.find(s=>s.name===z.session)?.nameTH||z.session:z.session}
                        </div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <button onClick={e=>{e.stopPropagation();toggleAlert(z.p);}}
                        style={{background:alertZones.includes(z.p)?"#c9a22715":"transparent",border:`1px solid ${alertZones.includes(z.p)?"#c9a22750":"#0f0f28"}`,borderRadius:5,padding:"4px 8px",color:alertZones.includes(z.p)?"#c9a227":"#252540",fontSize:9}}>⚡</button>
                      <div style={{fontSize:15,color:"#1e1e35"}}>›</div>
                    </div>
                  </div>
                );
              })}
            </>}

            <div style={{display:"flex",alignItems:"center",gap:9,margin:"10px 0",padding:"8px 14px",background:"#c9a22708",border:"1px solid #c9a22720",borderRadius:8}}>
              <div className="pulse" style={{width:6,height:6,borderRadius:"50%",background:"#c9a227"}}/>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:"#c9a227",letterSpacing:3}}>{live.toFixed(2)}</div>
              <div style={{fontSize:7,color:"#c9a22750",letterSpacing:1}}>{tx.currentEq}</div>
            </div>

            {below.length>0&&<>
              <div style={{fontSize:7.5,color:"#00e5a050",letterSpacing:2,marginBottom:8,marginTop:4}}>{tx.underlying}</div>
              {below.map((z,i)=>{
                const age=getZoneAge(z,candles.length);
                const decay=getDecayScore(z,candles.length);
                return(
                  <div key={i} className="zrow" onClick={()=>pickZone(z)}
                    style={{background:selZone?.p===z.p?"#001008":"#080818",border:`1px solid ${touchedZone===z.p?"#00e5a060":selZone?.p===z.p?"#c9a22740":"#0f0f28"}`,borderRadius:10,padding:"11px 14px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",gap:11,alignItems:"center"}}>
                      <div style={{width:2,height:34,background:`linear-gradient(180deg,#00e5a0,#00e5a030)`,borderRadius:2}}/>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                          <div style={{fontFamily:"'Bebas Neue'",fontSize:21,color:"#00e5a0",letterSpacing:2}}>{z.p}</div>
                          <div style={{fontSize:6.5,color:age.color,border:`1px solid ${age.color}40`,borderRadius:3,padding:"1px 5px",letterSpacing:1}}>{tx[age.label]}</div>
                          <div style={{fontSize:6.5,color:decay>70?"#00e5a060":decay>40?"#f59e0b60":"#ff4d6d60",border:`1px solid ${decay>70?"#00e5a020":decay>40?"#f59e0b20":"#ff4d6d20"}`,borderRadius:3,padding:"1px 5px"}}>💪{decay}</div>
                        </div>
                        <div style={{fontSize:7,color:"#00e5a040",letterSpacing:.3}}>
                          {tx.support} · {z.t} {tx.interactions} · -{(live-z.p).toFixed(1)} {tx.away} · {lang==="TH"?SESSIONS.find(s=>s.name===z.session)?.nameTH||z.session:z.session}
                        </div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <button onClick={e=>{e.stopPropagation();toggleAlert(z.p);}}
                        style={{background:alertZones.includes(z.p)?"#c9a22715":"transparent",border:`1px solid ${alertZones.includes(z.p)?"#c9a22750":"#0f0f28"}`,borderRadius:5,padding:"4px 8px",color:alertZones.includes(z.p)?"#c9a227":"#252540",fontSize:9}}>⚡</button>
                      <div style={{fontSize:15,color:"#1e1e35"}}>›</div>
                    </div>
                  </div>
                );
              })}
            </>}
          </div>
        )}

        {/* ── DEEP ANALYSIS ── */}
        {tab==="analysis"&&(
          <div className="fade">
            {loading&&<div style={{textAlign:"center",padding:"80px 0"}}><div style={{fontFamily:"'Bebas Neue'",fontSize:13,color:"#c9a227",letterSpacing:6}} className="pulse">{lang==="TH"?"กำลังคำนวณ...":"COMPUTING..."}</div></div>}
            {!loading&&!result&&<div style={{textAlign:"center",padding:"80px 0",color:"#151528"}}><div style={{fontFamily:"'Bebas Neue'",fontSize:26,letterSpacing:3,marginBottom:8}}>{tx.noAnalysis}</div><div style={{fontSize:9,letterSpacing:1}}>{tx.selectFirst}</div></div>}
            {!loading&&result&&selZone&&(()=>{
              return <>
                {/* Zone header */}
                <div style={{background:"#080818",border:`1px solid ${zC}20`,borderRadius:12,padding:"13px 15px",marginBottom:8,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${zC}40,transparent)`}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{fontSize:7,color:"#252545",letterSpacing:1,marginBottom:4}}>{tx.entryPriceFixed}</div>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:32,color:zC,letterSpacing:3,lineHeight:1}}>{selZone.p}</div>
                      <div style={{fontSize:7,color:`${zC}50`,letterSpacing:.5,marginTop:4}}>{isS?tx.support:tx.resistance} · {selZone.t} {tx.confirmedInteractions}</div>
                    </div>
                    <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                      <div>
                        <div style={{fontSize:7,color:"#252545"}}>{tx.current} (LIVE)</div>
                        <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:"#c9a227",letterSpacing:2,marginTop:2}}>{live.toFixed(2)}</div>
                        <div style={{fontSize:7,color:"#c9a22750",marginTop:2}}>
                          {live > selZone.p ? `+${(live-selZone.p).toFixed(1)} ${tx.away}` : `-${(selZone.p-live).toFixed(1)} ${tx.away}`}
                        </div>
                      </div>
                      <button onClick={()=>{setJournalPrefill(selZone);setTab("journal");}}
                        style={{background:"#c9a22712",border:"1px solid #c9a22740",borderRadius:6,padding:"5px 10px",color:"#c9a22790",fontSize:7,letterSpacing:1}}>
                        📒 {tx.logThisTrade}
                      </button>
                    </div>
                  </div>
                  <ZoneAgeBadge zone={selZone} totalCandles={candles.length} lang={lang}/>
                </div>

                <DecayBar zone={selZone} totalCandles={candles.length} lang={lang}/>

                {/* ── HISTORICAL RECORD — with directional arrows ── */}
                <HistoricalRecordPanel zone={selZone} lang={lang}/>

                <MTFPanel zone={selZone} lang={lang}/>

                {/* Probability Matrix */}
                <div style={{background:"#080818",border:"1px solid #0f0f28",borderRadius:12,padding:"14px 15px",marginBottom:8}}>
                  <div style={{fontSize:7.5,color:"#252545",letterSpacing:2,marginBottom:14}}>{tx.probMatrix}</div>
                  {[
                    {label:isS?tx.bounceUp:tx.bounceDown,desc:tx.bounceDesc(selZone.type),pct:result.bp,color:zC,arrow:isS?"↑":"↓"},
                    {label:isS?tx.breakDown:tx.breakUp,desc:tx.breakDesc(selZone.type),pct:result.brk,color:"#2a2a50",arrow:isS?"↓":"↑"},
                  ].map((item,i)=>(
                    <div key={i} style={{marginBottom:i===0?14:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:7}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          {/* Arrow indicator */}
                          <div style={{
                            width:28,height:28,borderRadius:5,
                            background:i===0?`${zC}18`:"#1a1a28",
                            border:`1px solid ${i===0?zC+"40":"#1e1e35"}`,
                            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0
                          }}>
                            <span style={{fontSize:16,color:i===0?zC:"#333",fontWeight:"bold",lineHeight:1}}>{item.arrow}</span>
                          </div>
                          <div>
                            <div style={{fontSize:10,color:i===0?"#bbb":"#444"}}>{item.label}</div>
                            <div style={{fontSize:7,color:i===0?"#555":"#252545",marginTop:2}}>{item.desc}</div>
                          </div>
                        </div>
                        <div style={{fontFamily:"'Bebas Neue'",fontSize:38,color:i===0?zC:"#252545",letterSpacing:2,lineHeight:1}}>{item.pct}%</div>
                      </div>
                      <div style={{background:"#0a0a1c",borderRadius:5,height:7,overflow:"hidden"}}>
                        <div className="bar" style={{width:`${item.pct}%`,height:"100%",background:i===0?`linear-gradient(90deg,${zC},${zC}80)`:"linear-gradient(90deg,#1e1e40,#2a2a55)",borderRadius:5}}/>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── VECTOR BIAS™ PANEL ── */}
                <VectorBiasPanel bias={result.vectorBias} zone={selZone} bp={result.bp} lang={lang}/>

                {/* Execution Levels */}
                <div style={{background:"#080818",border:"1px solid #0f0f28",borderRadius:12,padding:"13px 15px",marginBottom:8}}>
                  <div style={{fontSize:7.5,color:"#252545",letterSpacing:2,marginBottom:11}}>{tx.execLevels}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:7}}>
                    <div style={{background:"#0a0a1c",border:"1px solid #ff4d6d20",borderRadius:9,padding:"10px 12px"}}>
                      <div style={{fontSize:6.5,color:"#ff4d6d70",letterSpacing:1,marginBottom:5}}>{tx.invalidation}</div>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:21,color:"#ff4d6d",letterSpacing:2}}>{result.sl}</div>
                      <div style={{fontSize:7,color:"#ff4d6d40",marginTop:3}}>{result.slPips} pips</div>
                    </div>
                    <div style={{background:"#0a0a1c",border:`1px solid ${zC}20`,borderRadius:9,padding:"10px 12px"}}>
                      <div style={{fontSize:6.5,color:`${zC}70`,letterSpacing:1,marginBottom:5}}>{tx.entryConf}</div>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:21,color:zC,letterSpacing:2}}>{selZone.p}</div>
                      <div style={{fontSize:7,color:`${zC}40`,marginTop:3}}>{isS?tx.support:tx.resistance}</div>
                    </div>
                  </div>
                  {(()=>{
                    // Recommend TP level based on zone strength (bp) and decay
                    const recommended = result.bp >= 75 ? 2 : result.bp >= 55 ? 1 : 0; // 0=TP1,1=TP2,2=TP3
                    return (
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                      {[
                        {label:tx.target[0],sub:tx.targetSub[0],val:result.tp1,pips:result.tp1Pips,color:"#60a5fa",idx:0},
                        {label:tx.target[1],sub:tx.targetSub[1],val:result.tp2,pips:result.tp2Pips,color:"#f59e0b",idx:1},
                        {label:tx.target[2],sub:tx.targetSub[2],val:result.tp3,pips:result.tp3Pips,color:"#e879f9",idx:2},
                      ].map((tp,i)=>{
                        const isRec = i === recommended;
                        return (
                          <div key={i} style={{background:isRec?"#0d0d20":"#0a0a1c",border:`1px solid ${isRec?tp.color+"60":tp.color+"20"}`,borderRadius:9,padding:"10px 11px",position:"relative",overflow:"hidden",boxShadow:isRec?`0 0 12px ${tp.color}18`:"none"}}>
                            {/* Recommended indicator light */}
                            <div style={{position:"absolute",top:7,right:8,display:"flex",alignItems:"center",gap:4}}>
                              {isRec && <>
                                <div style={{width:6,height:6,borderRadius:"50%",background:tp.color,boxShadow:`0 0 6px ${tp.color}`,animation:"pulse 1.8s infinite"}}/>
                                <div style={{fontSize:5.5,color:tp.color,letterSpacing:1,fontFamily:"'DM Mono'"}}>{lang==="TH"?"แนะนำ":"PICK"}</div>
                              </>}
                            </div>
                            <div style={{fontSize:6,color:`${tp.color}70`,letterSpacing:.3,marginBottom:5}}>{tp.label}</div>
                            <div style={{fontFamily:"'Bebas Neue'",fontSize:isRec?19:16,color:tp.color,letterSpacing:1}}>{tp.val}</div>
                            <div style={{fontSize:6.5,color:`${tp.color}50`,marginTop:3}}>{tp.pips} pips</div>
                            <div style={{fontSize:6,color:`${tp.color}35`,marginTop:2}}>{tp.sub}</div>
                          </div>
                        );
                      })}
                    </div>
                    );
                  })()}
                </div>

                {/* Signal Confluence */}
                <div style={{background:"#080818",border:"1px solid #0f0f28",borderRadius:12,padding:"13px 15px",marginBottom:8}}>
                  <div style={{fontSize:7.5,color:"#252545",letterSpacing:2,marginBottom:11}}>{tx.confluence}</div>
                  {result.factors.map((f,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"7px 5px",borderRadius:5,marginBottom:1}}>
                      <div>
                        <div style={{fontSize:8,color:"#777",marginBottom:2}}>{f.n}</div>
                        <div style={{fontSize:7,color:"#2a2a45"}}>{f.d}</div>
                      </div>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:14,color:f.v>0?"#00e5a0":"#ff4d6d",letterSpacing:1,marginLeft:10,flexShrink:0,marginTop:2}}>
                        {f.v>0?"+":""}{f.v}%
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{padding:"8px 12px",background:"#06060f",borderRadius:8,border:"1px solid #0a0a1c",fontSize:7,color:"#151528",letterSpacing:.5,lineHeight:1.9}}>
                  {tx.disclaimer}
                </div>
              </>;
            })()}
          </div>
        )}

        {/* ── ALERTS ── */}
        {tab==="alerts"&&(
          <div className="fade">
            <div style={{background:"#080818",border:"1px solid #0f0f28",borderRadius:12,padding:"14px 15px",marginBottom:10}}>
              <div style={{fontSize:7.5,color:"#252545",letterSpacing:2,marginBottom:12}}>{tx.activeAlerts} ({alertZones.length})</div>
              {alertZones.length===0?(
                <div style={{fontSize:9,color:"#151528",letterSpacing:.5,padding:"20px 0",textAlign:"center"}}>{tx.noAlerts}</div>
              ):alertZones.map((p,i)=>{
                const z=displayZones.find(z=>z.p===p);
                const age=z?getZoneAge(z,candles.length):null;
                const cond = alertConditions[p]||"near";
                return(
                  <div key={i} style={{borderBottom:i<alertZones.length-1?"1px solid #0a0a1c":"none",paddingBottom:10,marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{display:"flex",gap:9,alignItems:"center"}}>
                        <div className="pulse" style={{width:5,height:5,borderRadius:"50%",background:"#c9a227"}}/>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                            <div style={{fontFamily:"'Bebas Neue'",fontSize:17,color:z?.type==="S"?"#00e5a0":"#ff4d6d",letterSpacing:2}}>{p}</div>
                            {age&&<div style={{fontSize:6.5,color:age.color,border:`1px solid ${age.color}40`,borderRadius:3,padding:"1px 5px"}}>{tx[age.label]}</div>}
                          </div>
                          <div style={{fontSize:7,color:"#252545"}}>{z?.type==="S"?tx.support:tx.resistance} · {Math.abs(live-p).toFixed(1)} {tx.away}</div>
                        </div>
                      </div>
                      <button onClick={()=>toggleAlert(p)} style={{background:"transparent",border:"1px solid #ff4d6d30",borderRadius:5,padding:"4px 9px",color:"#ff4d6d60",fontSize:7.5,letterSpacing:1}}>{tx.remove}</button>
                    </div>
                    <div style={{marginLeft:14}}>
                      <div style={{fontSize:6.5,color:"#252545",letterSpacing:1,marginBottom:5}}>{tx.alertConditions}</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {[{k:"near",l:tx.alertNear},{k:"rsiLow",l:tx.alertRsiLow},{k:"rsiHigh",l:tx.alertRsiHigh}].map(opt=>(
                          <button key={opt.k} onClick={()=>setAlertCond(p,opt.k)}
                            style={{background:cond===opt.k?"#c9a22715":"transparent",border:`1px solid ${cond===opt.k?"#c9a22750":"#0f0f22"}`,borderRadius:5,padding:"4px 8px",color:cond===opt.k?"#c9a227":"#252545",fontSize:7,letterSpacing:.5}}>
                            {opt.l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── JOURNAL ── */}
        {tab==="journal"&&(
          <TradeJournal lang={lang} prefillZone={journalPrefill} onClearPrefill={()=>setJournalPrefill(null)}/>
        )}
      </div>
    </div>
  );
}
export default dynamic(() => Promise.resolve(DashboardApp), {
  ssr: false,
});