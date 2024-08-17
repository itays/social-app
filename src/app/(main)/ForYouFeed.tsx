"use client";

import { LoadingButton } from "@/components/LoadingButton";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function ForYouFeed() {
  const {
    isPending,
    isError,
    data,
    isSuccess,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "for-you"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/for-you",
          pageParam ? { searchParams: { cursor: pageParam } } : undefined,
        )
        .json<PostPage>(),
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
    // TODO: fix this so that it works with the new pagination, currently it doesn't work, it only fetches the first page
    // onBottomReached only fires once and then it stops
    /*
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => {
        console.log("bottom reached"); // Bug: this only called once and then it stops
        if (hasNextPage && !isFetching) {
          console.log("fetching next page");
          fetchNextPage();
        }
      }}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
    */
    /**
     * Temporary fix for the bug with load more button
     */
    <div className="space-y-5">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {hasNextPage && (
        <LoadingButton
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          loading={isFetchingNextPage}
          className="mx-auto"
        >
          {isFetchingNextPage ? "Loading more..." : "Load more"}
        </LoadingButton>
      )}
    </div>
  );
}
