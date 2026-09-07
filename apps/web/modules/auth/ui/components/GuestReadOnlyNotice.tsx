import { cn } from "@workspace/ui/lib/utils";

interface GuestReadOnlyNoticeProps {
  className?: string;
}

export const GuestReadOnlyNotice = ({ className }: GuestReadOnlyNoticeProps) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      You&apos;re viewing a read-only guest demo. Sign up for a free account to make changes.
    </p>
  );
};
