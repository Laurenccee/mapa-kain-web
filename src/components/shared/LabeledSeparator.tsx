import { Separator } from '../ui/separator';

interface LabeledSeparatorProps {
  label: string;
  uppercase?: boolean;
}

export default function LabeledSeparator({
  label,
  uppercase,
}: LabeledSeparatorProps) {
  return (
    <div className="flex items-center gap-2 w-full ">
      <Separator className="flex-1" />
      <span className="text-xs text-muted-foreground">
        {uppercase ? label.toUpperCase() : label}
      </span>
      <Separator className="flex-1" />
    </div>
  );
}
