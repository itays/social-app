"use client";

import Post from "@/components/posts/Post";
import { PostData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function ForYouFeed() {
  const { isPending, isError, data } = useQuery<PostData[]>({
    queryKey: ["posy-feed", "for-you"],
    queryFn: async () => {
      const res = await fetch("/api/posts/for-you");
      if (!res.ok) {
        throw new Error(
          `Failed to fetch posts with status code: ${res.status}`,
        );
      }
      return res.json();
    },
  });

  if (isPending) {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  if (isError) {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading the feed
      </p>
    );
  }

  return (
    <>
      {data.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </>
  );
}
