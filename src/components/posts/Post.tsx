"use client";
import { PostData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import PostMoreButton from "./PostMoreButton";

type PostProps = {
  post: PostData;
};

export default function Post({ post }: PostProps) {
  const { user } = useSession();
  return (
    <article
      data-postid={post.id}
      // in tailwind you can give a group to an element and then use the group-hover pseudo class to apply styles to the element when the user hovers over it
      //
      className="group/post space-y-3 rounded-2xl bg-card p-5 shadow"
    >
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Link href={`/users/${post.user.username}`}>
            <UserAvatar avaterUrl={post.user.avatarUrl} />
          </Link>
          <div>
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
        {post.user.id === user.id && (
          <PostMoreButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>

      <div className="whitespace-pre-line break-words">{post.content}</div>
    </article>
  );
}
