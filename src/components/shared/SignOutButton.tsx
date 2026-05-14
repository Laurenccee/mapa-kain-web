'use client';

import { useTransition } from 'react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { signOutAction } from '@/features/auth/actions/auth';
import { toast } from 'sonner';

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
        router.refresh();
      } catch {
        toast.error('An unexpected error occurred');
      }
    });
  };
  return (
    <Button onClick={handleSignOut} disabled={isPending}>
      {isPending ? 'Signing Out...' : 'Sign Out'}
    </Button>
  );
}
