'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Email } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export default function EmailVerificationPage() {
  return (
    <section className="flex flex-1 justify-center items-center w-full px-4 flex-col gap-8">
      <div className="sm:max-w-xs w-full flex justify-center flex-col gap-8">
        <Card>
          <CardHeader className="gap-4">
            <CardTitle className="text-2xl text-center underline font-serif">
              Verify your Email
            </CardTitle>
            <CardDescription className="text-center">
              Please check your email for a verification link to activate your
              account. If you haven't received the email, please check your spam
              folder or request a new verification email.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button size="lg" className="w-full">
              Resend Verification Email
              <HugeiconsIcon icon={Email} />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
