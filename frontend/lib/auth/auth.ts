import { redirect } from 'next/navigation';
import { serverAxios } from '../axios/axios';
import type { UserI } from '@/types/users';

export async function getSession() {
  try {
    const res = await serverAxios.get<UserI>('/users/me');
    return res.data;
  } catch {
    redirect('/sign-in');
  }
}
