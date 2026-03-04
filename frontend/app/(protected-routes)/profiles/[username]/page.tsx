import Profile from '@/components/profile/Profile';

export default async function Page(props: {
  params: Promise<{ username: string }>;
}) {
  const params = await props.params;
  const username = params.username;

  return (
    <div>
      <Profile username={username} />
    </div>
  );
}
