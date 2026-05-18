'use client';

import { Button } from '../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      size="icon-lg"
      onClick={() => router.back()}
      asChild
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} />
    </Button>
  );
}
