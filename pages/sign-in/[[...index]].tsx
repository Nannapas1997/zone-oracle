// pages/sign-in/[[...index]].tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#050510", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <SignIn />
    </div>
  );
}
