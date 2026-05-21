import { Separator } from "../ui/separator";

interface LabeledSeparatorProps {
  label: string;
  uppercase?: boolean;
}

export default function LabeledSeparator({
  label,
  uppercase,
}: LabeledSeparatorProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <Separator className="flex-1" />
      <span className="text-muted-foreground text-xs">
        {uppercase ? label.toUpperCase() : label}
      </span>
      <Separator className="flex-1" />
    </div>
  );
}
