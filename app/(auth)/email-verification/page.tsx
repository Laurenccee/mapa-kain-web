"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Email } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function EmailVerificationPage() {
  return (
    <section className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="flex w-full flex-col justify-center gap-8 sm:max-w-xs">
        <Card>
          <CardHeader className="gap-4">
            <CardTitle className="text-center font-serif text-2xl underline">
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
