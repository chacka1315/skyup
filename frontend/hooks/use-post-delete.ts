import { PostI } from '@/types';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { isAxiosError } from 'axios';
import { ApiError } from '@/types/errors';
import { toast } from 'sonner';

export function usePostDelete(postId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await clientAxios.delete(`/posts/${postId}`);
      return res.data;
    },

    //Optimistic update stuff
    onMutate: async () => {
      const previousPosts = queryClient.getQueryData<PostI[]>([
        'posts',
        'feed',
      ]);

      if (previousPosts) {
        queryClient.setQueryData(['posts', 'feed'], (olds: PostI[]) => {
          const optimistData = olds.filter((old) => old.id !== postId);
          return optimistData;
        });
      }

      return { previousPosts };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'bookmarks'] });
      toast.success('Post has been deleted.', {
        toasterId: 'post-stuff',
      });
    },

    onError: (error, variables, context) => {
      if (isAxiosError<ApiError>(error)) {
        const detail = error.response?.data.detail;
        toast.error('Failed to delete the post.', {
          description: typeof detail == 'string' ? detail : '',
          toasterId: 'post-stuff',
        });
        //Manage rollback if update failed
        if (context?.previousPosts) {
          queryClient.setQueryData(['posts', 'feed'], context.previousPosts);
        }
      }
    },
  });

  return mutation;
}
