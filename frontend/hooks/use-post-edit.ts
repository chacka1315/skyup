import { PostI } from '@/types';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { isAxiosError } from 'axios';
import { ApiError } from '@/types/errors';
import { toast } from 'sonner';
import React from 'react';

export function usePostEdit(
  postId: string,
  setIsEditing: React.Dispatch<boolean>,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await clientAxios.put<PostI>(`/posts/${postId}`, {
        content,
      });

      return res.data;
    },

    //Optimistic update stuff
    onMutate: async (content) => {
      const previousPosts = queryClient.getQueryData<PostI[]>([
        'posts',
        'feed',
      ]);

      const previousSinglePost = queryClient.getQueryData<PostI>([
        'posts',
        'detail',
        postId,
      ]);

      if (previousPosts) {
        queryClient.setQueryData(['posts', 'feed'], (olds: PostI[]) => {
          const optimistData = olds.map((old) => {
            return old.id === postId
              ? { ...old, content: content }
              : { ...old };
          });
          return optimistData;
        });
      }

      if (previousSinglePost) {
        queryClient.setQueryData(['posts', 'detail', postId], (old: PostI) => ({
          ...old,
          content: content,
        }));
      }

      setIsEditing(false);
      return { previousPosts, previousSinglePost };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'detail'] });

      toast.success('Post has been updated successfully.', {
        toasterId: 'post-stuff',
      });
    },

    onError: (error, content, context) => {
      if (isAxiosError<ApiError>(error)) {
        const detail = error.response?.data.detail;
        toast.error('Post update failed.', {
          description: typeof detail == 'string' ? detail : '',
          toasterId: 'post-stuff',
        });
      }

      //Manage rollback if update failed
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts', 'feed'], context.previousPosts);
      }

      if (context?.previousSinglePost) {
        queryClient.setQueryData(
          ['posts', 'detail', postId],
          context.previousSinglePost,
        );
      }
    },
  });

  return mutation;
}
