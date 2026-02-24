import React from 'react';
import { getSession } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { UserI } from '@/types/users';

export default async function Profile(props: {
  params: Promise<{ username: string }>;
}) {
  const params = await props.params;
  const username = params.username;

  return <div>@{username} profile</div>;
}
