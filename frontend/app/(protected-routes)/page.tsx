import Posts from '@/components/posts/posts';
import Title from '@/components/title';
import CreatePost from '@/components/posts/create-post';
export default function Home() {
  return (
    <div>
      <Title title="Home" />
      <CreatePost />
      <Posts />
    </div>
  );
}
