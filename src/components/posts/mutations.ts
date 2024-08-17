import { PostData, PostPage } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { deletePostAction } from "./actions";

export function useDeletePostMutation(post: PostData) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // we need to redirect the usser if he deletes the post from the single post page
  const router = useRouter();
  const pathName = usePathname();

  const mutation = useMutation({
    mutationFn: deletePostAction,

    onSuccess: async (deletedPost) => {
      // onsuccess we want to invalidate the cache to remove the post immediately
      // we invalidate the cache for all post feeds so thats why we only pass 'post-feed' as the query key
      // this way we can update multiple feeds at the same time, we just need to pass that query key to  all query feeds later
      const queryFilter: QueryFilters = { queryKey: ["post-feed"] };
      await queryClient.cancelQueries(queryFilter);

      // Updates the cache by removing the deleted post from all relevant posts feeds.
      queryClient.setQueriesData<InfiniteData<PostPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) {
            return;
          }
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((post) => post.id !== deletedPost.id),
            })),
          };
        },
      );

      toast({
        description: "Post deleted successfully",
      });

      // If we're on the single post page, we want to redirect to the user page.
      if (pathName === `/posts/${deletedPost.id}`) {
        router.push(`/users/${deletedPost.user.username}`);
      }
    },
    onError(error) {
      toast({
        variant: "destructive",
        description: "An error occurred while deleting the post",
      });
    },
  });

  return mutation;
}
