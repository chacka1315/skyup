'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  InputGroupInput,
  InputGroupAddon,
  InputGroup,
  InputGroupButton,
} from '@/components/ui/input-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  EyeIcon,
  EyeOffIcon,
  LockKeyholeIcon,
  AtSignIcon,
  MailCheckIcon,
  IdCardIcon,
  LoaderIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/types/errors';
import FieldError from '@/components/field-error';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserI } from '@/types';
import { User } from '@/lib/zod';
import { useMutation } from '@tanstack/react-query';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<null | string>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [userData, setUserData] = useState({
    name: undefined,
    username: undefined,
    email: undefined,
    password: undefined,
    password_repeat: undefined,
  });

  const router = useRouter();

  const onInputsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.id;
    const value = e.target.value;

    const updatedUserData = { ...userData, [field]: value };
    const updatedFormErrs: Record<string, string> = {};

    const res = User.safeParse(updatedUserData);

    if (!res.success) {
      res.error.issues.forEach((i) => {
        updatedFormErrs[i.path[0].toString()] = i.message;
      });
    }

    setFormErrors(updatedFormErrs);
    setUserData(updatedUserData);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post<UserI>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-up/`,
        { ...userData },
        { withCredentials: true },
      );
      return res.data;
    },
    onSuccess: (createdUser) => {
      toast.success('Your account has been created.', { toasterId: 'global' });
      router.push(`/account-verification/${createdUser.id}`);
    },
    onError: (error) => {
      if (axios.isAxiosError<ApiError>(error)) {
        const detail = error.response?.data.detail;

        if (typeof detail == 'string') {
          setSubmitError(detail);
        } else {
          const newFormErrors = { ...formErrors };
          detail?.forEach((d) => (newFormErrors[d.loc[1]] = d.msg));
          setFormErrors(newFormErrors);
        }
      }
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="relative flex justify-center items-center h-screen">
      <div className=" hidden md:flex items-center gap-1 absolute top-4 left-10">
        <Image src="/logo.svg" height={30} width={30} alt="logo" />
        <p className="text-primary text-[22px] font-medium">SkyUp</p>
      </div>
      <Card className="h-fit max-w-[90vw] w-full md:w-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
          <CardDescription>
            Create an account and start skyuping...
            <p className="text-gray-400 mt-2.5">
              Already have account on SkyUp?{' '}
              <Link href="/sign-in" className="text-primary  hover:underline">
                Sign in{' '}
                <span aria-hidden className="font-black">
                  →
                </span>
              </Link>
            </p>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {submitError && (
              <section className="bg-amber-100 p-4 border-l-4 border-red-700 rounded-bl-[2px] rounded-tl-[2px]">
                <FieldError error={submitError} />
              </section>
            )}
            <section className="space-y-1">
              <Label htmlFor="name">Full name</Label>
              <InputGroup>
                <InputGroupInput
                  type="text"
                  id="name"
                  placeholder="Ex: John Doe"
                  required={true}
                  onChange={onInputsChange}
                  value={userData.name === undefined ? '' : userData.name}
                />
                <InputGroupAddon>
                  <IdCardIcon />
                </InputGroupAddon>
              </InputGroup>
              {userData.name !== undefined && formErrors.name && (
                <FieldError error={formErrors.name} />
              )}
            </section>
            <section className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <InputGroup>
                <InputGroupInput
                  type="text"
                  id="username"
                  placeholder="Ex: johndoe12"
                  required={true}
                  onChange={onInputsChange}
                  value={
                    userData.username === undefined ? '' : userData.username
                  }
                />
                <InputGroupAddon>
                  <AtSignIcon />
                </InputGroupAddon>
              </InputGroup>
              {userData.username !== undefined && formErrors.username && (
                <FieldError error={formErrors.username} />
              )}
            </section>
            <section className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <InputGroup>
                <InputGroupInput
                  type="email"
                  id="email"
                  placeholder="Ex: john@gmail.com"
                  required={true}
                  onChange={onInputsChange}
                  value={userData.email === undefined ? '' : userData.email}
                />
                <InputGroupAddon>
                  <MailCheckIcon />
                </InputGroupAddon>
              </InputGroup>
              {userData.email !== undefined && formErrors.email && (
                <FieldError error={formErrors.email} />
              )}
            </section>
            <section className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <InputGroup>
                <InputGroupInput
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="off"
                  onChange={onInputsChange}
                  value={
                    userData.password === undefined ? '' : userData.password
                  }
                />
                <InputGroupAddon>
                  <LockKeyholeIcon />
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {userData.password !== undefined && formErrors.password && (
                <FieldError error={formErrors.password} />
              )}
            </section>
            <section className="space-y-1">
              <Label htmlFor="password_repeat">Password confirmation</Label>
              <InputGroup>
                <InputGroupInput
                  type={showPassword ? 'text' : 'password'}
                  id="password_repeat"
                  autoComplete="off"
                  onChange={onInputsChange}
                  value={
                    userData.password_repeat === undefined
                      ? ''
                      : userData.password_repeat
                  }
                />
                <InputGroupAddon>
                  <LockKeyholeIcon />
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {userData.password_repeat !== undefined &&
                formErrors.password_repeat && (
                  <FieldError error={formErrors.password_repeat} />
                )}
            </section>
          </CardContent>
          <CardFooter className="mt-5">
            <Button
              className="w-full"
              disabled={
                mutation.isPending || Object.keys(formErrors).length > 0
              }
            >
              {mutation.isPending ? (
                <LoaderIcon className="animate-spin size-5 stroke-[3px]" />
              ) : (
                'Create account'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
