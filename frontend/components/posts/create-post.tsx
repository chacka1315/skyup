'use client';

import React, { Activity, useEffect, useRef, useState } from 'react';
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
import { Input } from '../ui/input';
import Image from 'next/image';
import { Label } from '../ui/label';

export default function CreatePost() {
  const { data: currentUser } = useQuery(currentUserOptions);
  const isOpen = useAppStore((state) => state.createPostAreaIsOpen);
  const setIsOpen = useAppStore((state) => state.setCreateAreaIsOpen);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | ArrayBuffer | null>(
    null,
  );

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
        icon: <CircleCheckIcon className="stroke-primary" />,
      });
      queryClient.setQueryData(['posts', 'feed'], (old: PostI[]) => {
        return [createdPost, ...old];
      });
      setContent('');
      setMedia(null);
      setMediaPreview(null);
    },
    onError: (error) => {
      if (isAxiosError<ApiError>(error)) {
        const detail = error.response?.data.detail;
        toast(<FieldError error="Post creation failed." />, {
          description: typeof detail == 'string' ? detail : '',
          toasterId: 'post-stuff',
          icon: <ErrorIcon className="stroke-red-700" />,
        });
      }
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const postData = new FormData();
    postData.append('content', content);
    if (media) {
      postData.append('media', media);
    }

    mutation.mutate(postData);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Chhange file');

    if (!e.target.files || !e.target.files[0]) return;

    const selected = e.target.files[0];
    const mediaType = selected.type;
    console.log(
      'Type:',
      mediaType,
      !mediaType.startsWith('image') && !mediaType.startsWith('video'),
    );

    if (!mediaType.startsWith('image') && !mediaType.startsWith('video')) {
      toast.warning('Only images and videos are authorized.', {
        toasterId: 'post-stuff',
      });
      e.target.value = '';
      return;
    }

    const ONE_MB = 1024 * 1024;

    if (selected?.size > 5 * ONE_MB && mediaType.startsWith('image')) {
      e.target.value = '';
      return toast.warning('Max allowed size for images is 5 Mb.', {
        toasterId: 'post-stuff',
      });
    } else if (selected?.size > 15 * ONE_MB && mediaType.startsWith('video')) {
      e.target.value = '';
      return toast.warning('Max allowed size for videos is 15 Mb.', {
        toasterId: 'post-stuff',
      });
    }

    //Setup the preview
    const fileReader = new FileReader();
    fileReader.readAsDataURL(selected);
    fileReader.onloadend = () => {
      setMediaPreview(fileReader.result);
    };

    setMedia(selected);
    e.target.value = '';
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

  const mediaLabelRef = useRef<null | HTMLLabelElement>(null);

  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <div className=" pt-2  pb-10 animate-show-post-field origin-top sticky top-0 z-10 bg-white">
        <ul className={clsx('px-6', { 'list-disc': errorList.length > 1 })}>
          {errorList}
        </ul>
        <form onSubmit={handleSubmit}>
          <InputGroup className="border-0 shadow-none rounded-none has-[[data-slot=input-group-control]:focus-visible]:ring-0">
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
                <Label htmlFor="media" ref={mediaLabelRef}>
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    onClick={() => mediaLabelRef.current?.click()}
                  >
                    <PaperclipIcon />
                  </InputGroupButton>
                  <Input
                    id="media"
                    type="file"
                    hidden
                    onChange={handleMediaChange}
                    accept="image/*, video/*"
                  />
                </Label>
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
        {media && mediaPreview && (
          <MediaPreview
            selected={media}
            preview={mediaPreview}
            setMedia={setMedia}
          />
        )}
      </div>
    </Activity>
  );
}

function MediaPreview({
  selected,
  preview,
  setMedia,
}: {
  selected: File;
  preview: string | null | ArrayBuffer;
  setMedia: React.Dispatch<React.SetStateAction<File | null>>;
}) {
  if (!preview) return null;

  let content: React.ReactNode;

  if (selected.type.startsWith('image')) {
    content = (
      <Image
        src={preview.toString()}
        width={120}
        height={120}
        alt="media preview"
        className="object-cover rounded-md"
      />
    );
  } else if (selected.type.startsWith('video')) {
    content = (
      <video
        src={preview.toString()}
        className="h-full w-full object-cover rounded-md"
        controls
        controlsList="play volume nofullscreen nodownload"
      ></video>
    );
  } else {
    return null;
  }

  return (
    <div className="w-30 relative ml-3">
      <Button
        variant="ghost"
        className="absolute right-0 top-0 has-[>svg]:p-1 h-fit translate-x-full"
        onClick={() => setMedia(null)}
      >
        <XIcon className="size-5" />
      </Button>
      {content}
    </div>
  );
}
