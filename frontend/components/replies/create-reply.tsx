'use client';

import React, { Activity, useEffect, useState } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '../ui/input-group';
import { XIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useQuery } from '@tanstack/react-query';
import { currentUserOptions } from '@/lib/query-options';
import useAppStore from '@/lib/store/store';
import UserAvatar from '../user-avatar';
import { Spinner } from '@/components/ui/spinner';

import { isAxiosError } from 'axios';
import { ApiError } from '@/types/errors';
import clsx from 'clsx';
import { useReply } from '@/hooks/use-reply';

export default function CreateReply() {
  const { data: currentUser } = useQuery(currentUserOptions);
  const isOpen = useAppStore((state) => state.createReplyAreaIsOpen);
  const setIsOpen = useAppStore((state) => state.setCreateReplyAreaIsOpen);
  const postToReply = useAppStore((state) => state.postToReply);
  const setPostToReply = useAppStore((state) => state.setPostToReply);
  const [content, setContent] = useState('');
  const { sendReply, error, isPending, reset } = useReply();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!postToReply) return;

    sendReply({ post: postToReply, replyContent: content });
    setContent('');
  };

  let errorList: React.ReactNode[] = [];

  if (error) {
    if (isAxiosError<ApiError>(error)) {
      const detail = error.response?.data.detail;
      if (Array.isArray(detail)) {
        errorList = detail.map((d, index) => (
          <li key={index} className="text-red-700 text-[12px]">
            {`${d.loc[1].charAt(0).toLocaleUpperCase() + d.loc[1].slice(1)} ${d.msg.toLocaleLowerCase()}.`}
          </li>
        ));
      }
    }
  }

  useEffect(() => {
    if (!error) return;

    const closeErrors = () => reset();
    document.addEventListener('click', closeErrors);
    return () => document.removeEventListener('click', closeErrors);
  }, [error]);

  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <div className=" pt-2  pb-2 animate-show-post-field origin-top sticky top-0 z-10 bg-white">
        <ul className={clsx('px-6', { 'list-disc': errorList.length > 1 })}>
          {errorList}
        </ul>
        <form onSubmit={handleSubmit}>
          <InputGroup className="border-0 shadow-none rounded-none has-[[data-slot=input-group-control]:focus-visible]:ring-0">
            <InputGroupAddon
              align="block-start"
              className="justify-between text-black"
            >
              <p className="text-gray-500">
                In response to{' '}
                <span className="text-primary">
                  @{postToReply?.author.username}
                </span>
              </p>
              <Button
                className=" w-6 h-6 p-1 rounded-full right-3 -top-4"
                onClick={() => setIsOpen(false)}
                type="button"
                variant="ghost"
              >
                <XIcon className="size-5" />
              </Button>
            </InputGroupAddon>
            <InputGroupAddon align="block-start">
              <UserAvatar user={currentUser} />
              <p>{currentUser?.profile.name}</p>
            </InputGroupAddon>

            <InputGroupTextarea
              id="content"
              placeholder="What do you think about the post?"
              className="placeholder:text-sm"
              value={content}
              maxLength={300}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
            />

            <InputGroupAddon align="block-end" className="justify-between">
              <InputGroupText className="font-normal">
                {content.length}/300
              </InputGroupText>
              <div className="flex items-center gap-2">
                {isPending && <Spinner className="size-5 text-black" />}
                <Button
                  type="submit"
                  className="rounded-full px-4 py-1 h-fit text-[13px]"
                  disabled={isPending}
                >
                  Reply
                </Button>
              </div>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>
    </Activity>
  );
}
