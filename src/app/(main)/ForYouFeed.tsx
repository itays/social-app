"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function ForYouFeed() {
  const {
    isPending,
    isError,
    data,
    isSuccess,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "for-you"],
    queryFn: ({ pageParam }) => {
      return kyInstance
        .get(
          "/api/posts/for-you",
          pageParam ? { searchParams: { cursor: pageParam } } : undefined,
        )
        .json<PostPage>();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (isPending) {
    return <PostsLoadingSkeleton />;
  }

  if (isError) {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading the feed
      </p>
    );
  }

  if (!posts.length && isSuccess && !hasNextPage) {
    return <p className="text-center text-muted-foreground">No posts found</p>;
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => {
        if (hasNextPage && !isFetching) {
          fetchNextPage();
        }
      }}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
