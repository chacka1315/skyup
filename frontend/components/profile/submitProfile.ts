import { clientAxios } from '@/lib/axios/axios-client';
import type { UserProfileI } from '@/types';

export default async function submitProfile(
  profileData: FormData,
): Promise<UserProfileI> {
  const res = await clientAxios.put<UserProfileI>('/profiles/', profileData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
}
