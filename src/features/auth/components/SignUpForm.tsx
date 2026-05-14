'use client';

import InputField from '@/components/shared/InputField';
import { Button } from '@/components/ui/button';
import { SignUpData, SignUpSchema } from '../schemas/authSchema';

import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight02Icon,
  Loading02Icon,
  LockPasswordIcon,
  User03Icon,
} from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import { signUpAction } from '../actions/auth';
import PasswordRulesCard from './PasswordRuleCard';
import { ROUTES } from '@/utils/constants/routes';
import { useRouter } from 'next/navigation';

export default function SignUpForm() {
  const [isPending, startTransistion] = useTransition();
  const router = useRouter();

  const { control, handleSubmit } = useForm<SignUpData>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSignUp: SubmitHandler<SignUpData> = async (data) => {
    startTransistion(async () => {
      try {
        const result = await signUpAction(data);

        if (result?.success === false) {
          toast.error(result.message || 'An error occurred during sign in.');
          return;
        }
        toast.success('Account created successfully!');
        router.push(ROUTES.SIGN_IN);
      } catch (error) {
        toast.error('An error occurred during sign up.');
      }
    });
  };

  const passwordValue = useWatch({ control, name: 'password' }) || '';

  return (
    <form
      id="sign-up-form"
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(handleSignUp)}
    >
      <div className="flex flex-col gap-2">
        <InputField
          label="Email"
          type="email"
          name="email"
          control={control}
          isPending={isPending}
          placeholder="Eg. john.doe@example.com"
          leadingIcon={
            <HugeiconsIcon
              icon={User03Icon}
              color="currentColor"
              strokeWidth={1.5}
            />
          }
        />
        <InputField
          label="Password"
          type="password"
          name="password"
          control={control}
          isPending={isPending}
          placeholder="Enter password"
          leadingIcon={
            <HugeiconsIcon
              icon={LockPasswordIcon}
              color="currentColor"
              strokeWidth={1.5}
            />
          }
        />
      </div>
      <PasswordRulesCard password={passwordValue} />
      <Button
        form="sign-up-form"
        size="lg"
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? 'Creating Account...' : 'Create Account'}
        {isPending ? (
          <HugeiconsIcon icon={Loading02Icon} className="animate-spin" /> 
        ) : (
          <HugeiconsIcon icon={ArrowRight02Icon} />
        )}
      </Button>
    </form>
  );
}
