'use client';

import { useEffect } from 'react';
import { Separator } from './ui/separator';

const Title = function ({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | SkyUp`;
  }, [title]);

  return (
    <>
      <p className="font-bold py-1 px-3">{title}</p>
      <Separator />
    </>
  );
};

export default Title;
