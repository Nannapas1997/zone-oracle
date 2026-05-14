export default function SignInPage() {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>เข้าสู่ระบบ</h1>
  
        <button
          onClick={() => {
            window.location.href = "/api/auth/signin/google";
          }}
        >
          Sign in with Google
        </button>
      </div>
    );
  }