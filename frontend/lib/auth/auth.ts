import { redirect } from 'next/navigation';
import { serverAxios } from '../axios/axios';
import type { User } from '@/types/users';

export async function getSession() {
  try {
    const res = await serverAxios.get<User>('/users/me');
    return res.data;
  } catch {
    redirect('/sign-in');
  }
}
