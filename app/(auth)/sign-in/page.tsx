import LabeledSeparator from '@/components/shared/LabeledSeparator';
import OAuthButtons from '@/features/auth/components/OAuthButtons';
import SignInForm from '@/features/auth/components/SignInForm';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <section className="flex flex-1 justify-center items-center w-full px-4 flex-col gap-8">
      <div className="sm:max-w-xs w-full flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl underline sm:text-center font-serif text-foreground">
            Sign In
          </h1>
          <p className="text-sm sm:text-center text-accent-foreground">
            Welcome back! Please sign in to continue.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <SignInForm />
          <LabeledSeparator label="Sign in with" />
          <OAuthButtons />
          <Link href="/sign-up" className="flex justify-center">
            <span className="text-sm text-foreground hover:underline">
              Don't have an account? <span className="font-bold">Sign Up</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
