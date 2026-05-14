export default function SignInPage() {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>เข้าสู่ระบบ</h1>
  
        <p>
          <a
            href="/api/auth/signin/google"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "#4285F4",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: "bold",
            }}
          >
            Sign in with Google
          </a>
        </p>
      </div>
    );
  }