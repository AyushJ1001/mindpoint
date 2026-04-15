import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="bg-muted/30 flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}
