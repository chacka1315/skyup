import React from 'react';
import { getSession } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { User } from '@/types/users';

export default async function Profile() {
  const currentUser = await getSession();
  // let currentUser: User | null = null;
  // let err: string | null = null;
  // try {
  //   currentUser = await getSession();
  // } catch (error) {
  //   err = error.message;
  //   console.log('🔅Failed to get current user:', err);
  // }

  if (!currentUser) {
    redirect('/sign-in');
  }

  return <div>Profile page visited by{JSON.stringify(currentUser)}</div>;
}
