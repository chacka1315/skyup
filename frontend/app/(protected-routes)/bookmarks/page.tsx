import React from 'react';
import Bookmarks from '@/components/posts/bookmarks';
import Title from '@/components/title';

export default function Page() {
  return (
    <div>
      <Title title="Bookmarks" />
      <Bookmarks />
    </div>
  );
}
