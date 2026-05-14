import LabeledSeparator from '@/components/shared/LabeledSeparator';
import OAuthButtons from '@/features/auth/components/OAuthButtons';
import SignUpForm from '@/features/auth/components/SignUpForm';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <section className="flex flex-1 justify-center items-center w-full px-4 flex-col gap-8">
      <div className="sm:max-w-xs w-full flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl underline sm:text-center font-serif text-foreground">
            Sign Up
          </h1>
          <p className="text-sm sm:text-center text-accent-foreground">
            Join us today! Create an account to get started.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <SignUpForm />
          <LabeledSeparator label="Sign up with" />
          <OAuthButtons />
          <Link href="/sign-in" className="flex justify-center">
            <span className="text-sm text-foreground hover:underline">
              Already have an account?{' '}
              <span className="font-bold">Sign In</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
