import LabeledSeparator from "@/components/shared/LabeledSeparator";
import OAuthButtons from "@/features/auth/components/OAuthButtons";
import SignInForm from "@/features/auth/components/SignInForm";
import Link from "next/link";

export default function SignInPage() {
  return (
    <section className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="flex w-full flex-col gap-8 sm:max-w-xs">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground font-serif text-4xl underline sm:text-center">
            Sign In
          </h1>
          <p className="text-accent-foreground text-sm sm:text-center">
            Welcome back! Please sign in to continue.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <SignInForm />
          <LabeledSeparator label="Sign in with" />
          <OAuthButtons />
          <Link href="/sign-up" className="flex justify-center">
            <span className="text-foreground text-sm hover:underline">
              Don't have an account? <span className="font-bold">Sign Up</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
