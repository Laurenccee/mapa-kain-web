import { Checkbox } from '@/components/ui/checkbox';
import { ROUTES } from '@/utils/constants/routes';
import Link from 'next/link';

interface FormActionsProps {
  rememberMe: boolean;
  onRememberMeChange: (checked: boolean) => void;
}

export default function FormActions({
  rememberMe,
  onRememberMeChange,
}: FormActionsProps) {
  return (
    <div className="flex justify-between">
      <div className="flex items-center">
        <Checkbox
          checked={rememberMe}
          onCheckedChange={(checked) => onRememberMeChange(checked === true)}
        />
        <span className="text-sm text-accent-foreground ml-2">Remember me</span>
      </div>
      <div>
        <Link
          href={ROUTES.FORGET_PASSWORD}
          className="text-sm text-foreground hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}
