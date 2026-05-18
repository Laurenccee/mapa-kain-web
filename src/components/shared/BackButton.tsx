'use client';

import { Button } from '../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace('/map');
    }
  };
  return (
    <Button variant="secondary" size="icon-lg" onClick={goBack} asChild>
      <HugeiconsIcon icon={ArrowLeft01Icon} />
    </Button>
  );
}
