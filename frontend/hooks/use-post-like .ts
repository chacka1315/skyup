import { PostI } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { toast } from 'sonner';

type LikeMode = 'add' | 'remove';

export const usePostLike = (postId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (mode: LikeMode) => {
      if (mode == 'add') {
        return await clientAxios.post(`/posts/${postId}/like/`);
      } else {
        return await clientAxios.delete(`/posts/${postId}/like/`);
      }
    },

    onMutate: async (mode) => {
      //Optimistic update stuff
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['posts', 'feed'] }),
        queryClient.cancelQueries({ queryKey: ['posts', 'bookmarks'] }),
      ]);

      const previousFeedData = queryClient.getQueryData<PostI[]>([
        'posts',
        'feed',
      ]);

      const previousSinglePost = queryClient.getQueryData<PostI>([
        'posts',
        'detail',
        postId,
      ]);

      const previousBookmarksData = queryClient.getQueryData<PostI[]>([
        'posts',
        'bookmarks',
      ]);

      const updateLikeState = (olds: PostI[] = []) => {
        return olds.map((old) => {
          if (mode == 'remove') {
            return old.id == postId
              ? {
                  ...old,
                  is_liked_by_me: false,
                  likes_count: old.likes_count - 1,
                }
              : { ...old };
          } else {
            return old.id == postId
              ? {
                  ...old,
                  is_liked_by_me: true,
                  likes_count: old.likes_count + 1,
                }
              : { ...old };
          }
        });
      };

      queryClient.setQueryData<PostI[]>(['posts', 'feed'], updateLikeState);
      queryClient.setQueryData<PostI[]>(
        ['posts', 'bookmarks'],
        updateLikeState,
      );

      if (previousSinglePost) {
        queryClient.setQueryData<PostI>(['posts', 'detail', postId], (old) => {
          if (old) {
            const updated = updateLikeState([{ ...old }]);
            return updated[0];
          }
        });
      }

      return { previousFeedData, previousBookmarksData, previousSinglePost };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'bookmarks'] });
    },

    onError: (error, mode, context) => {
      if (mode == 'remove') {
        toast.error('Failed to dislike the post.', { toasterId: 'post-stuff' });
      } else {
        toast.error('Failed to like the post.', {
          toasterId: 'post-stuff',
        });
      }
      queryClient.setQueryData(['posts', 'feed'], context?.previousFeedData);
      queryClient.setQueryData(
        ['posts', 'bookmarks'],
        context?.previousBookmarksData,
      );

      if (context?.previousSinglePost) {
        queryClient.setQueryData(
          ['posts', 'detail', postId],
          context.previousSinglePost,
        );
      }
    },
  });

  return { toggle: mutation.mutate };
};
