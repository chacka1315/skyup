import { PostI, UserI } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { toast } from 'sonner';

export const useFollowAuthor = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (post: PostI) => {
      const res = await clientAxios.post(`/relations/`, {
        following_id: post.author.id,
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
          return { ...old, author: { ...post.author, is_followed: true } };
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
      toast.success(`Your are following @${post.author.username}`, {
        toasterId: 'post-stuff',
      });
    },
  });

  return { send_follow: mutation.mutate };
};

export function useFollowUser() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (variables: {
      mode: 'follow' | 'unfollow';
      user: UserI;
    }) => {
      if (variables.mode === 'follow') {
        await clientAxios.post('/relations', {
          following_id: variables.user.id,
        });
      } else {
        await clientAxios.delete('/relations', {
          data: { following_id: variables.user.id },
        });
      }
    },

    onMutate: (variables) => {
      const previousFollowers = queryClient.getQueryData<UserI[]>([
        'users',
        'followers',
      ]);
      const previousFollowings = queryClient.getQueryData<UserI[]>([
        'users',
        'followings',
      ]);

      if (previousFollowers && variables.mode === 'follow') {
        queryClient.setQueryData<UserI[]>(
          ['users', 'followers'],
          (olds = []) => {
            return olds.map((old) => {
              return old.id === variables.user.id
                ? { ...old, is_followed_by_me: true }
                : { ...old };
            });
          },
        );
      }

      if (previousFollowings && variables.mode === 'unfollow') {
        queryClient.setQueryData<UserI[]>(
          ['users', 'followings'],
          (olds = []) => {
            return olds.filter((old) => old.id !== variables.user.id);
          },
        );
      }

      return { previousFollowers, previousFollowings };
    },
    onSuccess: (data, variables) => {
      if (variables.mode === 'follow') {
        toast.success(`You are now following @${variables.user.username}.`, {
          toasterId: 'post-stuff',
        });
      } else {
        toast.success(
          `You are no longer following @${variables.user.username}.`,
          {
            toasterId: 'post-stuff',
          },
        );
      }

      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error, variables, context) => {
      if (variables.mode === 'follow') {
        toast.error(`You cannot follow @${variables.user.username}.`, {
          toasterId: 'post-stuff',
        });
      } else {
        toast.error(`Failed to unfollow @${variables.user.username}.`, {
          toasterId: 'post-stuff',
        });
      }

      if (context?.previousFollowers) {
        queryClient.setQueryData(
          ['users', 'followers'],
          context.previousFollowers,
        );
      }
      if (context?.previousFollowings) {
        queryClient.setQueryData(
          ['users', 'followings'],
          context.previousFollowings,
        );
      }
    },
  });

  const follow = (user: UserI) => mutation.mutate({ mode: 'follow', user });
  const unfollow = (user: UserI) => mutation.mutate({ mode: 'unfollow', user });

  return { follow, unfollow };
}
