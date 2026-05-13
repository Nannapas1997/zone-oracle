// pages/index.tsx — Landing page
import Head from "next/head";
import Link from "next/link";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useRouter } from "next/router";

export default function Landing() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  if (isSignedIn) { router.replace("/dashboard"); return null; }

  return (
    <>
      <Head>
        <title>Zone Oracle — Institutional Probability Engine</title>
        <meta name="description" content="AI-powered support & resistance zones for XAUUSD. Real-time institutional analysis." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#050510", color: "#c8c0a8", fontFamily: "'DM Mono', monospace" }}>

        {/* ── NAV ── */}
        <nav style={{ borderBottom: "1px solid #0f0f28", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 5, color: "#c9a227" }}>ZONE ORACLE</div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/pricing" style={{ fontSize: 9, color: "#555", letterSpacing: 2, padding: "8px 14px" }}>PRICING</Link>
            <SignInButton mode="modal">
              <button style={{ background: "transparent", border: "1px solid #c9a22740", borderRadius: 6, padding: "7px 18px", color: "#c9a227", fontSize: 9, letterSpacing: 2 }}>LOG IN</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button style={{ background: "#c9a22720", border: "1px solid #c9a22760", borderRadius: 6, padding: "7px 18px", color: "#c9a227", fontSize: 9, letterSpacing: 2 }}>START FREE</button>
            </SignUpButton>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
          <div style={{ fontSize: 8, color: "#c9a22760", letterSpacing: 4, marginBottom: 20 }}>INSTITUTIONAL PROBABILITY ENGINE · v6.1</div>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 62, color: "#c9a227", letterSpacing: 6, lineHeight: 1, marginBottom: 24 }}>
            KNOW WHERE<br />GOLD MOVES NEXT
          </h1>
          <p style={{ fontSize: 11, color: "#444", lineHeight: 1.9, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
            Real-time support & resistance zones for XAUUSD — backed by institutional liquidity analysis, multi-timeframe confluence, and historical zone memory.
          </p>
          <SignUpButton mode="modal">
            <button style={{ background: "#c9a22718", border: "1px solid #c9a22750", borderRadius: 8, padding: "14px 36px", color: "#c9a227", fontSize: 11, letterSpacing: 3, cursor: "pointer" }}>
              START FREE TRIAL →
            </button>
          </SignUpButton>
          <div style={{ fontSize: 8, color: "#252545", marginTop: 14, letterSpacing: 1 }}>No credit card required · 7-day free trial</div>
        </div>

        {/* ── FEATURES ── */}
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { icon: "◈", title: "LIVE PRICE FEED", desc: "WebSocket connection to TwelveData. Real-time tick-by-tick XAUUSD price." },
            { icon: "◆", title: "ZONE ORACLE™", desc: "Institutional-grade support & resistance with strength decay and historical bounce rate." },
            { icon: "⬡", title: "VECTOR BIAS™", desc: "Directional probability matrix with multi-timeframe confluence scoring." },
          ].map((f, i) => (
            <div key={i} style={{ background: "#080818", border: "1px solid #0f0f28", borderRadius: 12, padding: "22px 20px" }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: "#c9a22760", marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 9, color: "#c9a227", letterSpacing: 2, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 9, color: "#333", lineHeight: 1.8 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* ── FOOTER ── */}
        <div style={{ borderTop: "1px solid #0f0f28", padding: "20px 24px", textAlign: "center", fontSize: 7, color: "#151528", letterSpacing: 1 }}>
          ZONE ORACLE · Not financial advice · For educational purposes only
        </div>
      </div>
    </>
  );
}
