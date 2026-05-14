// pages/pricing.tsx
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Pricing() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const isActive = status === "authenticated";

  const plans = [
    {
      id: "monthly" as const,
      label: "MONTHLY",
      price: "฿990",
      sub: "per month",
      usd: "~$27/mo",
      features: [
        "Real-time XAUUSD feed",
        "Zone Oracle™ analysis",
        "Vector Bias™ signals",
        "Trade journal",
        "Multi-timeframe confluence",
      ],
      cta: "START FREE TRIAL",
    },
    {
      id: "yearly" as const,
      label: "YEARLY",
      price: "฿7,990",
      sub: "per year",
      usd: "~$220/yr · Save 33%",
      features: [
        "Everything in Monthly",
        "Priority support",
        "Early access to new features",
        "Export to CSV",
      ],
      cta: "START FREE TRIAL",
      highlight: true,
    },
  ];

  return (
    <>
      <Head>
        <title>Pricing — Zone Oracle</title>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "#050510",
          color: "#c8c0a8",
          fontFamily: "'DM Mono', monospace",
        }}
      >
        {/* NAV */}
        <nav
          style={{
            borderBottom: "1px solid #0f0f28",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "'Bebas Neue'",
              fontSize: 22,
              letterSpacing: 5,
              color: "#c9a227",
              textDecoration: "none",
            }}
          >
            ZONE ORACLE
          </Link>

          {isActive ? (
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                background: "#c9a22720",
                border: "1px solid #c9a22750",
                borderRadius: 6,
                padding: "7px 18px",
                color: "#c9a227",
                fontSize: 9,
                letterSpacing: 2,
                cursor: "pointer",
              }}
            >
              OPEN APP →
            </button>
          ) : null}
        </nav>

        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "60px 24px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: 50,
            }}
          >
            <div
              style={{
                fontFamily: "'Bebas Neue'",
                fontSize: 42,
                color: "#c9a227",
                letterSpacing: 5,
                marginBottom: 10,
              }}
            >
              PRICING
            </div>

            <div
              style={{
                fontSize: 9,
                color: "#333",
                letterSpacing: 1,
              }}
            >
              7-day free trial · Cancel anytime · Secure payment via Stripe
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            {plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  background: "#080818",
                  border: `1px solid ${
                    plan.highlight ? "#c9a22750" : "#0f0f28"
                  }`,
                  borderRadius: 14,
                  padding: "28px 24px",
                  position: "relative",
                }}
              >
                {plan.highlight && (
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#c9a22720",
                      border: "1px solid #c9a22760",
                      borderRadius: 4,
                      padding: "3px 14px",
                      fontSize: 7,
                      color: "#c9a227",
                      letterSpacing: 2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    BEST VALUE
                  </div>
                )}

                <div
                  style={{
                    fontSize: 8,
                    color: "#c9a22780",
                    letterSpacing: 3,
                    marginBottom: 10,
                  }}
                >
                  {plan.label}
                </div>

                <div
                  style={{
                    fontFamily: "'Bebas Neue'",
                    fontSize: 42,
                    color: "#c9a227",
                    letterSpacing: 2,
                    lineHeight: 1,
                  }}
                >
                  {plan.price}
                </div>

                <div
                  style={{
                    fontSize: 7,
                    color: "#333",
                    letterSpacing: 1,
                    marginTop: 4,
                    marginBottom: 4,
                  }}
                >
                  {plan.sub}
                </div>

                <div
                  style={{
                    fontSize: 7.5,
                    color: "#555",
                    marginBottom: 24,
                  }}
                >
                  {plan.usd}
                </div>

                <div style={{ marginBottom: 24 }}>
                  {plan.features.map((feature, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        padding: "5px 0",
                        fontSize: 8.5,
                        color: "#444",
                      }}
                    >
                      <span
                        style={{
                          color: "#c9a22760",
                          fontSize: 10,
                        }}
                      >
                        ◆
                      </span>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* FIXED BUTTON */}
                <Link
                  href="/sign-up"
                  style={{
                    display: "block",
                    width: "100%",
                    textDecoration: "none",
                  }}
                  onClick={() => setLoading(plan.id)}
                >
                  <button
                    type="button"
                    disabled={loading === plan.id}
                    style={{
                      width: "100%",
                      padding: "12px 0",
                      background: "#c9a22718",
                      border: "1px solid #c9a22750",
                      borderRadius: 8,
                      color: "#c9a227",
                      fontSize: 9,
                      letterSpacing: 2,
                      cursor: "pointer",
                    }}
                  >
                    {loading === plan.id ? "LOADING..." : "START FREE"}
                  </button>
                </Link>
              </div>
            ))}
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 30,
              fontSize: 7,
              color: "#1a1a2e",
              lineHeight: 2,
              letterSpacing: 0.5,
            }}
          >
            Payments processed securely by Stripe · Thai baht pricing · SSL
            encrypted
            <br />
            Zone Oracle is for educational purposes only. Not financial advice.
          </div>
        </div>
      </div>
    </>
  );
}