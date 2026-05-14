import { signIn, getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
      redirect: false,
    });

    if (result?.error) {
      setError("Email หรือ Password ไม่ถูกต้อง");
    } else {
      window.location.href = "/dashboard";
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f0f0f",
    }}>
      <div style={{
        background: "#1a1a1a",
        padding: "2rem",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "400px",
        border: "1px solid #333",
      }}>
        <h1 style={{ color: "#fff", marginBottom: "1.5rem", textAlign: "center" }}>
          Zone Oracle
        </h1>

        {/* Login ด้วย Google */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          style={{
            width: "100%",
            padding: "0.75rem",
            marginBottom: "1rem",
            background: "#fff",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          🔵 เข้าสู่ระบบด้วย Google
        </button>

        <div style={{ color: "#666", textAlign: "center", margin: "1rem 0" }}>
          — หรือ —
        </div>

        {/* Login ด้วย Email/Password */}
        <form onSubmit={handleCredentials}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "0.75rem",
              background: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "1rem",
              background: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p style={{ color: "#ff4444", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: loading ? "#555" : "#f59e0b",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ถ้า login แล้ว redirect ไป dashboard เลย
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (session) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }
  return { props: {} };
};
