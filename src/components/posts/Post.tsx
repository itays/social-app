import { PostData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate } from "@/lib/utils";

type PostProps = {
  post: PostData;
};

export default function Post({ post }: PostProps) {
  return (
    <article
      data-postid={post.id}
      className="space-y-3 rounded-2xl bg-card p-5 shadow"
    >
      <div className="flex flex-wrap gap-3">
        <Link href={`/users/${post.user.username}`}>
          <UserAvatar avaterUrl={post.user.avatarUrl} />
        </Link>
        <div className="">
          <Link
            className="block font-medium hover:underline"
            href={`/users/${post.user.username}`}
          >
            {post.user.displayName}
          </Link>
          <Link
            href={`/posts/${post.id}`}
            className="block text-sm text-muted-foreground hover:underline"
          >
            {formatRelativeDate(post.createdAt)}
          </Link>
        </div>
      </div>
      <div className="whitespace-pre-line break-words">{post.content}</div>
    </article>
  );
}
