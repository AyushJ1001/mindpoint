import { SignInClient } from "./SignInClient";

export default function SignInPage() {
  return (
    <div className="bg-muted/30 flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <SignInClient />
    </div>
  );
}
