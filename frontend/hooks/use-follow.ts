import { PostI } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { toast } from 'sonner';

export const useFollowAuthor = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (post: PostI) => {
      const res = await clientAxios.post(`/relations/`, {
        receiver_id: post.author.id,
      });
      return res.data;
    },

    onMutate: (post) => {
      const previousPost = queryClient.getQueryData<PostI>([
        'posts',
        'detail',
        post.id,
      ]);

      queryClient.setQueryData<PostI>(['posts', 'detail', post.id], (old) => {
        if (old) {
          return { ...old, author: { ...post.author, is_my_friend: true } };
        }
      });

      return { previousPost };
    },

    onError: (error, post, context) => {
      queryClient.setQueryData<PostI>(['posts', 'detail', post.id], () => {
        if (context?.previousPost) {
          return context.previousPost;
        }
      });
      toast.error(`Failed to follow @${post.author.username}.`, {
        toasterId: 'post-stuff',
      });
    },

    onSuccess: (data, post) => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'detail'] });
      toast.success(`Follow request sent to @${post.author.username}`, {
        toasterId: 'post-stuff',
      });
    },
  });

  return { send_follow: mutation.mutate };
};
