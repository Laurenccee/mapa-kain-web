import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ForgetPasswordForm from '@/features/auth/components/ForgetPasswordForm';
import { ROUTES } from '@/utils/constants/routes';
import {
  ArrowLeft02Icon,
  InformationSquareIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';

export default function ForgetPasswordPage() {
  return (
    <section className="flex flex-1 justify-center items-center w-full px-4 flex-col gap-8">
      <div className="sm:max-w-xs w-full flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl underline font-serif text-foreground">
            Forget Password
          </h1>
          <p className="text-sm text-accent-foreground">
            Don't worry! Enter your email and we'll send you a link to reset
            your password.
          </p>
        </div>
        <ForgetPasswordForm />
        <div className="flex flex-col gap-8">
          <Card>
            <CardContent className="flex gap-4 items-center">
              <HugeiconsIcon
                icon={InformationSquareIcon}
                color="currentColor"
                size={32}
              />
              <p className="text-sm text-foreground">
                Can't access your email? Please contact our support collective
                for manual account verification.
              </p>
            </CardContent>
          </Card>
          <Separator />
          <Link
            href={ROUTES.SIGN_IN}
            className="text-xs flex gap-2 items-center text-foreground"
          >
            <HugeiconsIcon
              icon={ArrowLeft02Icon}
              color="currentColor"
              size={16}
            />
            <span className="hover:underline">Back to Sign in</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
