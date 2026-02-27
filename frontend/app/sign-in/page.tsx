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
  MailCheckIcon,
  LoaderIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import FieldError from '@/components/field-error';
import { ApiError } from '@/types/errors';
import { SuccessAuth } from '@/types/auth';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [submitError, setSubmitError] = useState<null | string>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [userData, setUserData] = useState({ username: '', password: '' });

  const router = useRouter();

  const onInputsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.id;
    const value = e.target.value;
    setUserData({ ...userData, [field]: value });
    setFormErrors({ ...formErrors, [field]: '' });
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmiting(true);

    const formData = new FormData();

    for (const [key, value] of Object.entries(userData)) {
      formData.append(key, value);
    }

    try {
      const res = await axios.post<SuccessAuth>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login/`,
        formData,
        { withCredentials: true },
      );
      localStorage.setItem('access_token', res.data.access_token);

      router.push('/');
    } catch (error) {
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
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center h-screen">
      <div className="flex items-center gap-1 absolute top-4 left-10">
        <Image src="/logo.svg" height={30} width={30} alt="logo" />
        <p className="text-primary text-[22px] font-medium">SkyUp</p>
      </div>
      <Card className="h-fit max-w-[90vw] w-full md:w-98">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Connect your account and start skyuping...
            <p className="text-gray-400 mt-2.5">
              Don&apos;t have an account on SkyUp?{' '}
              <Link href="/sign-up" className="text-primary  hover:underline">
                Register{' '}
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
              <Label htmlFor="email">Email</Label>

              {/* We use email as username to satisfy Oauth2 rules */}
              <InputGroup>
                <InputGroupInput
                  type="email"
                  id="username"
                  placeholder="Ex: john@gmail.com"
                  required={true}
                  onChange={onInputsChange}
                  value={userData.username}
                />
                <InputGroupAddon>
                  <MailCheckIcon />
                </InputGroupAddon>
              </InputGroup>
              <FieldError error={formErrors.username} />
            </section>
            <section className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <InputGroup>
                <InputGroupInput
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="off"
                  onChange={onInputsChange}
                  value={userData.password}
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
              <FieldError error={formErrors.password} />
            </section>
          </CardContent>
          <CardFooter className="mt-5">
            <Button className="w-full">
              {isSubmiting ? (
                <LoaderIcon className="animate-spin size-5 stroke-[3px]" />
              ) : (
                'Connect account'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
