import Image from "next/image";
import avatarPlaceHolder from "@/assets/avatar.png";
import { cn } from "@/lib/utils";

type Props = {
  avaterUrl?: string | null;
  size?: number;
  className?: string;
};

export default function UserAvatar({ avaterUrl, size, className }: Props) {
  return (
    <Image
      src={avaterUrl || avatarPlaceHolder}
      alt="User avatar"
      width={size ?? 48}
      height={size ?? 48}
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className,
      )}
    />
  );
}
