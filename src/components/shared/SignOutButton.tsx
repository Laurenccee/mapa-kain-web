'use client';

import { useTransition } from 'react';
import { Button, buttonVariants } from '../ui/button';
import { useRouter } from 'next/navigation';
import { signOutAction } from '@/features/auth/actions/auth';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Loader, Logout01Icon } from '@hugeicons/core-free-icons';
import { ROUTES } from '@/utils/constants/routes';

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSignOut = async () => {
    startTransition(async () => {
      try {
        const result = await signOutAction();

        if (result?.success === false) {
          toast.error(result.message || 'Logout failed');

          return;
        }
        toast.success('Signed out');
        router.replace(ROUTES.ROOT);
      } catch {
        toast.error('An unexpected error occurred');
      }
    });
  };
  return (
    <Button
      onClick={handleSignOut}
      disabled={isPending}
      size="icon-lg"
      variant="secondary"
    >
      {isPending ? (
        <HugeiconsIcon icon={Loader} className="animate-spin" />
      ) : (
        <HugeiconsIcon icon={Logout01Icon} />
      )}
    </Button>
  );
}
