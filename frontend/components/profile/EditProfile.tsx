'use client';

import { isAxiosError } from 'axios';
import type { ChangeEvent, ReactNode } from 'react';
import { useMemo, useReducer, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import type { ApiError } from '@/types/errors';
import type { UserI } from '@/types';

import getCountries from './getCountries';
import { EDIT_ACTIONS, editReducer, initState } from './editReducer';

import { toast } from 'sonner';
import { ImagePlusIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useProfileUpdate } from '@/hooks/use-profile-update';
import FieldError from '../field-error';
interface EditProfileProps {
  user: UserI;
  closeEditPanel: () => void;
}

export default function EditProfile({
  user,
  closeEditPanel,
}: EditProfileProps) {
  const countries = useMemo(() => getCountries(), []);
  const [editState, editDispatch] = useReducer(editReducer, user, initState);

  const profileUpdate = useProfileUpdate(user.username, closeEditPanel);

  const onInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    editDispatch({
      type: EDIT_ACTIONS.UPDATE_INPUT,
      payload: {
        name: e.target.name as 'name' | 'bio' | 'birthday',
        value: e.target.value,
      },
    });
  };

  const onCountrySelect = (value: string) => {
    editDispatch({
      type: EDIT_ACTIONS.UPDATE_COUNTRY,
      payload: value,
    });
  };

  const onFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const selected = files?.[0];

    if (!selected || (name !== 'avatar' && name !== 'banner')) return;

    const mediaType = selected.type;

    console.log(mediaType);

    if (!mediaType.startsWith('image')) {
      toast.warning('Only images are authorized.', {
        toasterId: 'post-stuff',
      });
      e.target.value = '';
      return;
    }

    const ONE_MB = 1024 * 1024;

    if (selected?.size > 10 * ONE_MB) {
      e.target.value = '';
      return toast.warning(
        'Max allowed size for profile and banner pics is 10 Mb.',
        {
          toasterId: 'global',
        },
      );
    }

    editDispatch({
      type: EDIT_ACTIONS.UPDATE_FILE,
      payload: { name, file: selected },
    });

    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      if (typeof fileReader.result !== 'string') return;
      editDispatch({
        type: EDIT_ACTIONS.UPDATE_PREVIEW,
        payload: { name, preview: fileReader.result },
      });
    };
    fileReader.readAsDataURL(selected);
    e.target.value = '';
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (Object.keys(editState.inputErrs).length > 0) return;

    const formData = new FormData();
    formData.append('name', editState.inputValues.name.trim());
    if (editState.inputValues.bio.trim()) {
      formData.append('bio', editState.inputValues.bio.trim());
    }
    if (editState.inputValues.country.trim()) {
      formData.append('country', editState.inputValues.country.trim());
    }
    if (editState.inputValues.birthday) {
      formData.append('birthday', editState.inputValues.birthday);
    }
    if (editState.inputFiles.avatar) {
      formData.append('avatar', editState.inputFiles.avatar);
    }
    if (editState.inputFiles.banner) {
      formData.append('banner', editState.inputFiles.banner);
    }

    profileUpdate.save(formData);
  };

  const apiErrors: ReactNode[] = [];

  if (profileUpdate.error && isAxiosError<ApiError>(profileUpdate.error)) {
    const detail = profileUpdate.error.response?.data.detail;
    if (Array.isArray(detail)) {
      for (const [index, err] of detail.entries()) {
        const field = String(err.loc.at(-1) ?? 'field');
        apiErrors.push(
          <li key={`${field}-${index}`} className="text-[0.78rem] text-red-700">
            {`${field}: ${err.msg}`}
          </li>,
        );
      }
    } else if (typeof detail === 'string') {
      apiErrors.push(
        <li key="api-error" className="text-[0.78rem] text-red-700">
          {detail}
        </li>,
      );
    }
  }
  useEffect(() => {
    console.log('profile use effect');

    if (!profileUpdate.error) return;

    const closeErrors = () => profileUpdate.reset();
    document.addEventListener('click', closeErrors);
    return () => document.removeEventListener('click', closeErrors);
  }, [profileUpdate.isError]);

  return (
    <div className="w-full pb-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ProfilePicsInputs
          previews={editState.previews}
          onFilesChange={onFilesChange}
        />
        <div className="flex flex-col gap-1">
          {editState.inputErrs.banner && (
            <FieldError error={editState.inputErrs.banner} />
          )}
          {editState.inputErrs.avatar && (
            <FieldError error={editState.inputErrs.avatar} />
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <section className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              onChange={onInputChange}
              value={editState.inputValues.name}
              maxLength={50}
              autoFocus={true}
            />
            {editState.inputErrs.name && (
              <FieldError error={editState.inputErrs.name} />
            )}
          </section>

          <section className="flex flex-col gap-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              onChange={onInputChange}
              value={editState.inputValues.bio}
              rows={3}
              maxLength={255}
              className="min-h-20 resize-y"
              spellCheck="false"
            />
            {editState.inputErrs.bio && (
              <FieldError error={editState.inputErrs.bio} />
            )}
          </section>

          <section className="flex flex-col gap-1.5">
            <Label htmlFor="birthday">Birthday</Label>
            <Input
              id="birthday"
              name="birthday"
              onChange={onInputChange}
              type="date"
              value={editState.inputValues.birthday}
              className="max-w-56"
            />
            {editState.inputErrs.birthday && (
              <FieldError error={editState.inputErrs.birthday} />
            )}
          </section>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="country">Country</Label>
            <Select
              value={editState.inputValues.country || undefined}
              onValueChange={onCountrySelect}
            >
              <SelectTrigger id="country" className="w-full">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectLabel>Contries</SelectLabel>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {apiErrors.length > 0 && (
          <ul className="flex flex-col gap-1">{apiErrors}</ul>
        )}

        <div className="mt-2 flex justify-between gap-3">
          <Button
            type="button"
            onClick={closeEditPanel}
            className="min-w-22"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              profileUpdate.isPending ||
              Object.keys(editState.inputErrs).length > 0
            }
          >
            {profileUpdate.isPending ? (
              <>
                <Spinner /> Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ProfilePicsInputs({
  previews,
  onFilesChange,
}: {
  previews: Record<'avatar' | 'banner', string | null>;
  onFilesChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="relative mb-1">
      <label className="relative block h-40 md:h-45 w-full cursor-pointer overflow-hidden rounded-md">
        {previews.banner ? (
          <img src={previews.banner} alt="banner preview" />
        ) : (
          <div className="h-full w-full bg-primary" />
        )}
        <input
          type="file"
          name="banner"
          accept="image/*"
          onChange={onFilesChange}
          hidden
        />
        <ImagePlusIcon className="text-white absolute top-1/2 left-1/2 -translate-1/2" />
      </label>

      <label className="relative bottom-12 left-4 h-19 w-19 md:h-22 md:w-22 cursor-pointer bg-gray-100 size-20 md:size-23 rounded-full flex items-center justify-center">
        <Avatar className="size-18 md:size-21">
          <AvatarImage
            src={previews.avatar ?? undefined}
            alt={'avatar preview'}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold"></AvatarFallback>
        </Avatar>
        <input
          type="file"
          name="avatar"
          accept="image/*"
          onChange={onFilesChange}
          hidden
        />
        <ImagePlusIcon className="text-white absolute top-1/2 left-1/2 -translate-1/2" />
      </label>
    </div>
  );
}
