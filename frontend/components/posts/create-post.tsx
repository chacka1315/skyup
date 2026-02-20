'use client';

import React, { Activity, useEffect, useState } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '../ui/input-group';
import {
  CircleCheckIcon,
  PaperclipIcon,
  SendHorizonal,
  XIcon,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { currentUserOptions } from '@/lib/query-options';
import useAppStore from '@/lib/store/store';
import { toast } from 'sonner';
import UserAvatar from '../user-avatar';
import { Spinner } from '@/components/ui/spinner';
import { useMutation } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { PostI } from '@/types';
import { isAxiosError } from 'axios';
import { ApiError } from '@/types/errors';
import FieldError from '../field-error';
import { MdErrorOutline as ErrorIcon } from 'react-icons/md';
import clsx from 'clsx';

export default function CreatePost() {
  const { data: currentUser } = useQuery(currentUserOptions);
  const isOpen = useAppStore((state) => state.createPostAreaIsOpen);
  const setIsOpen = useAppStore((state) => state.setCreateAreaIsOpen);
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postData: FormData) => {
      const res = await clientAxios.post<PostI>('/posts/', postData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return res.data;
    },

    onSuccess: (createdPost) => {
      toast('Post has been created successfully.', {
        toasterId: 'post-stuff',
        icon: <CircleCheckIcon className="fill-primary stroke-white" />,
      });
      queryClient.setQueryData(['posts', 'feed'], (old: PostI[]) => {
        return [createdPost, ...old];
      });
      setContent('');
    },
    onError: (error) => {
      if (isAxiosError<ApiError>(error)) {
        const detail = error.response?.data.detail;
        toast(<FieldError error="Post creation failed." />, {
          description: typeof detail == 'string' ? detail : '',
          toasterId: 'post-stuff',
          icon: <ErrorIcon className="fill-red-700" />,
        });
      }
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const postData = new FormData();
    postData.append('content', content);
    mutation.mutate(postData);
  };

  let errorList: React.ReactNode[] = [];

  if (mutation.isError) {
    // console.log('✅', mutation.error.response.data);

    if (isAxiosError<ApiError>(mutation.error)) {
      const detail = mutation.error.response?.data.detail;
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
    if (!mutation.isError) return;
    const closeErrors = () => mutation.reset();

    document.addEventListener('click', closeErrors);

    return () => document.removeEventListener('click', closeErrors);
  }, [mutation.isError]);

  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <div className=" pt-2 animate-show-post-field origin-top sticky top-0 z-10 bg-white">
        <ul className={clsx('px-6', { 'list-disc': errorList.length > 1 })}>
          {errorList}
        </ul>
        <form onSubmit={handleSubmit}>
          <InputGroup className="border-none rounded-none  has-[[data-slot=input-group-control]:focus-visible]:ring-0">
            <InputGroupTextarea
              id="content"
              placeholder="What's happening?"
              value={content}
              maxLength={300}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
            />
            <InputGroupAddon align="block-start" className="justify-between">
              {currentUser && <UserAvatar user={currentUser} />}
              <Button
                className=" w-6 h-6 p-1 rounded-full right-3 -top-4"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <XIcon className="size-5" />
              </Button>
            </InputGroupAddon>
            <InputGroupAddon align="block-end" className="justify-between">
              <div className="flex items-center gap-4">
                <InputGroupText className="font-normal">
                  {content.length}/300
                </InputGroupText>
                <InputGroupButton type="button" variant="ghost">
                  <PaperclipIcon />
                </InputGroupButton>
              </div>
              <Button
                type="submit"
                className="rounded-full px-2 py-1 h-fit text-[13px]"
                disabled={mutation.isPending}
              >
                Skyup
                {mutation.isPending ? <Spinner /> : <SendHorizonal />}
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>
    </Activity>
  );
}
