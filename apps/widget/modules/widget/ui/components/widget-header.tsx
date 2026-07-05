import { cn } from "@workspace/ui/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const WidgetHeader = ({ children, className }: Props) => {
  return (
    <header className={cn("bg-primary p-4 text-primary-foreground", className)}>
      {children}
    </header>
  );
};

export default WidgetHeader;

