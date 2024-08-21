import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

/**
 * This hook can be used to fetch the follower info of a user, like in our follower button and also in the profile page
 */
export default function useFollowerInfo(
  userId: string,
  initialState: FollowerInfo,
) {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () =>
      kyInstance
        .get(`/api/posts/users/${userId}/followers`)
        .json<FollowerInfo>(),
    initialData: initialState, // so that we get the first state directly from the server
    /**
     * Setting 'staleTime: Infinity' because we'll have the follower button many times on the page,
     * and like button even more, so we don't want to refetch the data
     * every we toggle between different feeds, because then we might fetch the follower data or the like info
     * for 100 posts, so we set the stale time to Infinity which basically means that this doesn't revalidate automatically
     * unless we ask it to revalidate
     */
    staleTime: Infinity,
  });
  return query;
}
