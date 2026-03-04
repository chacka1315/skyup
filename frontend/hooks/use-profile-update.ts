import submitProfile from '@/components/profile/submitProfile';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { UserI, UserProfileI } from '@/types';
import { currentUserOptions } from '@/lib/query-options';
import { toast } from 'sonner';

export function useProfileUpdate(username: string, closeEditPanel: () => void) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitProfile,
    onSuccess: (updatedProfile: UserProfileI) => {
      queryClient.setQueryData<UserI>(
        currentUserOptions.queryKey,
        (oldUser) => {
          if (!oldUser) return oldUser;
          return { ...oldUser, profile: updatedProfile };
        },
      );
      queryClient.invalidateQueries({
        queryKey: ['users', 'profile', username],
      });
      toast.success('Your profile has been updated.', { toasterId: 'global' });
      closeEditPanel();
    },
    onError: () => {
      toast.error('Failed to update your profile.', { toasterId: 'global' });
    },
  });

  return {
    save: mutation.mutate,
    error: mutation.error,
    isPending: mutation.isPending,
    reset: mutation.reset,
    isError: mutation.isError,
  };
}
