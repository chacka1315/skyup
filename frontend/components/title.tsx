'use client';

import { useEffect } from 'react';

const Title = function ({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | SkyUp`;
  }, [title]);

  return <p className="font-bold py-1 px-3">{title}</p>;
};

export default Title;
