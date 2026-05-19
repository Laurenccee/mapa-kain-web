'use client';

import { useTransition } from 'react';
import { Button, buttonVariants } from '../ui/button';
import { useRouter } from 'next/navigation';
import { signOutAction } from '@/features/auth/actions/auth';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Loader, Logout01Icon, Sign } from '@hugeicons/core-free-icons';
import { ROUTES } from '@/utils/constants/routes';
import { cn } from '@/lib/utils';

interface SignOutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'secondary' | 'outline' | 'ghost' | 'link' | 'default';
  size?: 'lg' | 'icon-lg';
  className?: string;
}

export default function SignOutButton({
  variant = 'secondary',
  size = 'icon-lg',
  className,
}: SignOutButtonProps) {
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
      size={size}
      variant={variant}
      className={cn(size !== 'icon-lg' && 'w-full', className)}
    >
      {size === 'icon-lg' ? (
        isPending ? (
          <HugeiconsIcon icon={Loader} className="animate-spin" />
        ) : (
          <HugeiconsIcon icon={Logout01Icon} />
        )
      ) : isPending ? (
        <>
          Signing Out...
          <HugeiconsIcon icon={Loader} className="animate-spin" />
        </>
      ) : (
        <>
          Sign Out
          <HugeiconsIcon icon={Logout01Icon} />
        </>
      )}
    </Button>
  );
}
