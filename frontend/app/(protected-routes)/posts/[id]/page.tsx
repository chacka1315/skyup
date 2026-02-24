import SinglePost from '@/components/single-post/single-post';
import Replies from '@/components/replies/replies';
import Title from '@/components/title';

export default async function page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const postId = params.id;
  return (
    <div>
      <Title title="Post" />
      <SinglePost postId={postId} />
      <p className="font-bold px-3 py-4">Replies on the post</p>
      <Replies postId={postId} />
    </div>
  );
}
