import { useToast } from "@/components/ui/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPostAction } from "./actions";
import { PostPage } from "@/lib/types";

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: submitPostAction,
    onSuccess: async (newPost) => {
      /**
       * optimistic update - we take the newly created post and add it to the first page of the feed without waiting for the server to respond
       */
      const queryfilter: QueryFilters = {
        queryKey: ["post-feed", "for-you"],
      };
      // stop any running query if there is one (if we mutate the cache and then it loads the next page we will get bugs)
      queryClient.cancelQueries(queryfilter);
      queryClient.setQueriesData<InfiniteData<PostPage, string | null>>(
        queryfilter,
        (oldData) => {
          // we want to take the old data and add the new post to the beginning of the array
          const firstPage = oldData?.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );
      /**
       * edge case where user submits a post before the first page is loaded.
       * so we invalidate the query only if the old data is null
       */
      queryClient.invalidateQueries({
        queryKey: queryfilter.queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });
      toast({
        description: "Post submitted successfully",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        description: "An error occurred while submitting the post",
      });
    },
  });
  return mutation;
}
