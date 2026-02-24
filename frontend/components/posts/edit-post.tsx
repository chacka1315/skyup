import React from 'react';
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
} from '../ui/input-group';
import { useState } from 'react';
import { PostI } from '@/types';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { CheckIcon, UndoIcon } from 'lucide-react';
import { usePostEdit } from '@/hooks/use-post-edit';

type EditPostProps = {
  setIsEditing: React.Dispatch<boolean>;
  post: PostI;
};

export default function EditPost({ setIsEditing, post }: EditPostProps) {
  const [content, setContent] = useState(post.content);
  const postUpdate = usePostEdit(post.id, setIsEditing);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    postUpdate.mutate(content);
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup className="border-0 shadow-none rounded-none has-[[data-slot=input-group-control]:focus-visible]:ring-0">
        <InputGroupTextarea
          id="content"
          placeholder="What's change?"
          value={content}
          maxLength={300}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
        />
        <InputGroupAddon align="block-end" className="justify-between">
          <div className="flex items-center gap-4">
            <InputGroupText className="font-normal">
              {content.length}/300
            </InputGroupText>
          </div>
          <div className="space-x-3">
            <Button
              type="button"
              className=""
              variant="destructive"
              disabled={postUpdate.isPending}
              onClick={() => setIsEditing(false)}
            >
              <UndoIcon />
            </Button>
            <Button type="submit" className="" disabled={postUpdate.isPending}>
              {postUpdate.isPending ? <Spinner /> : <CheckIcon />}
            </Button>
          </div>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
