import { queryOptions } from '@tanstack/react-query';
import { useSession } from './auth/client-auth';

export const currentUserOptions = queryOptions({
  queryKey: ['current-user'],
  queryFn: useSession,
  staleTime: Infinity,
  retry: false,
});
