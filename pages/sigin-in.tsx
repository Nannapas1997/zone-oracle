import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Sign In</h1>
      <button onClick={() => signIn("google")}>
        Sign in with Google
      </button>
    </div>
  );
}