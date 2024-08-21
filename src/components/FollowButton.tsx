"use client";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { LoadingButton } from "./LoadingButton";

type FollowButtonProps = {
  userId: string;
  initialState: FollowerInfo;
};

export default function FollowButton({
  userId,
  initialState,
}: FollowButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useFollowerInfo(userId, initialState);
  const queryKey: QueryKey = ["follower-info", userId];
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/posts/users/${userId}/followers`)
        : kyInstance.post(`/api/posts/users/${userId}/followers`),
    onMutate: async () => {
      // optimistic update - update the UI before the request is made

      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousState?.followers ?? 0) +
          (previousState?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousState?.isFollowedByUser,
      }));
      return { previousState }; // when we return the previous state, we will get this back in onError
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousState); // revert the UI to the previous state
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while following/unfollowing the user",
        variant: "destructive",
      });
    },
    onSuccess: (data, variables, context) => {
      console.log(data, variables, context);
      toast({
        title: "Success",
        description: `You have ${
          context?.previousState?.isFollowedByUser ? "unfollowed" : "followed"
        } the user`,
      });
    },
  });

  return (
    <LoadingButton
      loading={isLoading}
      variant={data.isFollowedByUser ? "secondary" : "default"}
      onClick={() => mutate()}
    >
      {data.isFollowedByUser ? "Unfollow" : "Follow"}
    </LoadingButton>
  );
}
