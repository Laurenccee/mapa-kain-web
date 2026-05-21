import LabeledSeparator from "@/components/shared/LabeledSeparator";
import OAuthButtons from "@/features/auth/components/OAuthButtons";
import SignUpForm from "@/features/auth/components/SignUpForm";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <section className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="flex w-full flex-col gap-8 sm:max-w-xs">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground font-serif text-4xl underline sm:text-center">
            Sign Up
          </h1>
          <p className="text-accent-foreground text-sm sm:text-center">
            Join us today! Create an account to get started.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <SignUpForm />
          <LabeledSeparator label="Sign up with" />
          <OAuthButtons />
          <Link href="/sign-in" className="flex justify-center">
            <span className="text-foreground text-sm hover:underline">
              Already have an account?{" "}
              <span className="font-bold">Sign In</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
