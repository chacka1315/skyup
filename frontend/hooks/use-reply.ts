import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { PostI, ReplyI } from '@/types';
import { isAxiosError } from 'axios';
import { ApiError } from '@/types/errors';
import useAppStore from '@/lib/store/store';

type ReplyData = {
  post: PostI;
  replyContent: string;
};

export function useReply() {
  const queryClient = useQueryClient();
  const setReplyAreaIsOpen = useAppStore(
    (state) => state.setCreateReplyAreaIsOpen,
  );
  const setPostToReply = useAppStore((state) => state.setPostToReply);

  const mutation = useMutation({
    mutationFn: async (variables: ReplyData) => {
      const res = await clientAxios.post<ReplyI>(
        `/posts/${variables.post.id}/replies`,
        { content: variables.replyContent },
      );
      return res.data;
    },

    onSuccess: (createdReply, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });

      toast.success(`You have replied to @${variables.post.author.username}.`, {
        toasterId: 'post-stuff',
      });

      queryClient.setQueryData(
        ['replies', 'list', variables.post.id],
        (old: ReplyI[] = []) => {
          return [createdReply, ...old];
        },
      );

      const existingFeed = queryClient.getQueryData(['posts', 'feed']);

      if (existingFeed) {
        queryClient.setQueryData<PostI[]>(['posts', 'feed'], (olds = []) => {
          return olds.map((old) => {
            return old.id === variables.post.id
              ? { ...old, replies_count: old.replies_count + 1 }
              : old;
          });
        });
      }

      queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', variables.post.id],
      });

      setReplyAreaIsOpen(false);
      setPostToReply(null);
    },
    onError: (error, variables) => {
      if (isAxiosError<ApiError>(error)) {
        const detail = error.response?.data.detail;
        toast.error(`Failed to reply to @${variables.post.author.username}.`, {
          description: typeof detail == 'string' ? detail : '',
          toasterId: 'post-stuff',
        });
      }
    },
  });

  return {
    sendReply: mutation.mutate,
    error: mutation.error,
    isPending: mutation.isPending,
    reset: mutation.reset,
  };
}
