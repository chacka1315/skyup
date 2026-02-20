'use client';

import { redirect } from 'next/navigation';
import { clientAxios } from '../axios/axios-client';
import type { UserI } from '@/types/users';

export async function useSession() {
  try {
    const res = await clientAxios.get<UserI>('/users/me/');
    return res.data;
  } catch {
    redirect('/sign-in');
  }
}
