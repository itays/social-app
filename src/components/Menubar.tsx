import { ComponentProps, PropsWithChildren } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Bell, Bookmark, Home, Mail } from "lucide-react";

type MenubarProps = ComponentProps<"a"> & {
  Icon: typeof Home;
};

const LINKS: MenubarProps[] = [
  { title: "Home", href: "/", Icon: Home },
  { title: "Notifications", href: "/notifications", Icon: Bell },
  { title: "Messages", href: "/messages", Icon: Mail },
  { title: "Bookmarks", href: "/bookmarks", Icon: Bookmark },
];

export default function Menubar({
  className,
}: PropsWithChildren<ComponentProps<"div">>) {
  return (
    <div className={className}>
      {LINKS.map((link) => (
        <MenubarItem key={link.title} {...link} />
      ))}
    </div>
  );
}

function MenubarItem({ title, href, Icon }: MenubarProps) {
  return (
    <Button
      key={title}
      variant={"ghost"}
      className="flex items-center justify-start gap-3"
      title={title}
      asChild
    >
      <Link href={href ?? ""}>
        <Icon />
        <span className="hidden lg:inline">{title}</span>
      </Link>
    </Button>
  );
}
