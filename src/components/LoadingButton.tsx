import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./ui/button";
import { Loader2 } from "lucide-react";

type Props = ButtonProps & {
  loading: boolean;
};

export function LoadingButton({
  loading,
  disabled,
  className,
  children,
  ...props
}: Props) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {loading && <Loader2 className="size-5 animate-spin" />}
      {children}
    </Button>
  );
}
