import { PostI } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { toast } from 'sonner';

type BookmarkMode = 'add' | 'remove';

export const usePostBookmark = (postId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (mode: BookmarkMode) => {
      if (mode == 'add') {
        return await clientAxios.post(`/posts/${postId}/bookmark/`);
      } else {
        return await clientAxios.delete(`/posts/${postId}/bookmark/`);
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
      const previousBookmarksData = queryClient.getQueryData<PostI[]>([
        'posts',
        'bookmarks',
      ]);
      const previousSinglePost = queryClient.getQueryData<PostI>([
        'posts',
        'detail',
        postId,
      ]);

      const updateBookmarkState = (olds: PostI[] = []) => {
        return olds.map((old) => {
          if (mode == 'remove') {
            return old.id == postId
              ? {
                  ...old,
                  is_bookmarked_by_me: false,
                  bookmarks_count: old.bookmarks_count - 1,
                }
              : { ...old };
          } else {
            return old.id == postId
              ? {
                  ...old,
                  is_bookmarked_by_me: true,
                  bookmarks_count: old.bookmarks_count + 1,
                }
              : { ...old };
          }
        });
      };

      if (previousBookmarksData) {
        queryClient.setQueryData<PostI[]>(
          ['posts', 'feed'],
          updateBookmarkState,
        );
      }

      if (previousFeedData) {
        queryClient.setQueryData<PostI[]>(
          ['posts', 'bookmarks'],
          (olds = []) => {
            if (mode == 'remove') {
              return olds.filter((old) => old.id !== postId);
            }

            return olds.map((old) => {
              return old.id == postId
                ? {
                    ...old,
                    is_bookmarked_by_me: true,
                    bookmarks_count: old.bookmarks_count + 1,
                  }
                : { ...old };
            });
          },
        );
      }

      if (previousSinglePost) {
        queryClient.setQueryData<PostI>(['posts', 'detail', postId], (old) => {
          if (old) {
            const updated = updateBookmarkState([{ ...old }]);
            return updated[0];
          }
        });
      }

      return { previousFeedData, previousBookmarksData, previousSinglePost };
    },

    onError: (error, mode, context) => {
      if (mode == 'remove') {
        toast.error('Failed to delete the post from your bookmarks', {
          toasterId: 'post-stuff',
        });
      } else {
        toast.error('Failed to bookmark the post.', {
          toasterId: 'post-stuff',
        });
      }

      if (context?.previousFeedData) {
        queryClient.setQueryData(['posts', 'feed'], context.previousFeedData);
      }

      if (context?.previousBookmarksData) {
        queryClient.setQueryData(
          ['posts', 'bookmarks'],
          context?.previousBookmarksData,
        );
      }

      if (context?.previousSinglePost) {
        queryClient.setQueryData(
          ['posts', 'detail', postId],
          context.previousSinglePost,
        );
      }
    },

    onSuccess: (data, mode) => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'bookmarks'] });
      if (mode == 'remove') {
        toast.success('Post deleted from your bookmarks.', {
          toasterId: 'post-stuff',
        });
      } else {
        toast.success('Post added to your bookmarks.', {
          toasterId: 'post-stuff',
        });
      }
    },
  });

  return { toggle: mutation.mutate };
};
