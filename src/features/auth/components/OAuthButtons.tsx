"use client";

import { Button } from "@/components/ui/button";
import { FacebookIcon, GoogleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function OAuthButtons() {
  return (
    <section className="flex w-full justify-center gap-2">
      <Button variant="outline" size="icon-lg" className="justify-center gap-2">
        <HugeiconsIcon
          icon={GoogleIcon}
          color="currentColor"
          strokeWidth={1.5}
        />
      </Button>
      <Button variant="outline" size="icon-lg" className="justify-center gap-2">
        <HugeiconsIcon
          icon={FacebookIcon}
          color="currentColor"
          strokeWidth={1.5}
        />
      </Button>
    </section>
  );
}
