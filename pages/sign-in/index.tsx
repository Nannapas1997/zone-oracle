import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const router = useRouter();
  const { error } = router.query;

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>เข้าสู่ระบบ</h1>

      {error && (
        <p style={{ color: "red" }}>
          Error: {error}
        </p>
      )}

      <button onClick={() => signIn("google", { callbackUrl: "/" })}>
        Sign in with Google
      </button>
    </div>
  );
}