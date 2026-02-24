'use client';

import { ReplyI, PostAuthorI } from '@/types';
import { formatPostDate } from '@/lib/utils';
import { Separator } from '../ui/separator';
import UserAvatar from '../user-avatar';

export default function ReplyCard({ reply }: { reply: ReplyI }) {
  return (
    <>
      <div className="flex items-start px-3 gap-2">
        <UserAvatar user={reply.author} />
        <div className="w-full">
          <ReplyAuthor author={reply.author} createdAt={reply.created_at} />
          <section>
            <p className="font-normal text-[13px] md:text-[14px]">
              {reply.content}
            </p>
          </section>
        </div>
      </div>
      <Separator />
    </>
  );
}

type ReplyAuthorProps = {
  author: PostAuthorI;
  createdAt: string;
};

function ReplyAuthor({ author, createdAt }: ReplyAuthorProps) {
  return (
    <section className=" text-[13px] md:text-[15px] flex items-center gap-2">
      <p className="font-semibold">{author.profile.name}</p>
      <p className="text-gray-500">@{author.username}</p>
      <span className="h-0.5 w-0.5 bg-gray-500 rounded-full"></span>
      <p className=" text-gray-500">{formatPostDate(createdAt)}</p>
    </section>
  );
}
