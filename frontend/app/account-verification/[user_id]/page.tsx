'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import React from 'react';
import { useState } from 'react';
import { LoaderIcon } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useParams } from 'next/navigation';
import { ApiError } from '@/types/errors';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import FieldError from '@/components/field-error';

export default function AccountVerification() {
  const { user_id } = useParams();
  const [code, setCode] = useState<string>('');
  const [submitError, setSubmitError] = useState<null | string>(null);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/email-verification/`,
        { code, user_id },
        { withCredentials: true },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success('Your account is now verified.', { toasterId: 'global' });
      router.push('/sign-in');
    },
    onError: (error) => {
      if (axios.isAxiosError<ApiError>(error)) {
        const detail = error.response?.data.detail;
        if (typeof detail == 'string') {
          setSubmitError(detail);
        } else {
          setSubmitError('An unexpected error occured.');
        }
      }
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className=" relative h-screen flex items-center justify-center">
      <div className="hidden md:flex items-center gap-1 absolute top-4 left-10">
        <Image src="/logo.svg" height={30} width={30} alt="logo" />
        <p className="text-primary text-[22px] font-medium">SkyUp</p>
      </div>
      <Card className="h-fit  w-full max-w-[90vw] md:w-90">
        <CardHeader>
          <CardTitle className="text-[22px] font-bold">
            Email verification
          </CardTitle>
          <CardDescription>
            Your account has been created. An email verificcation code has been
            sent to your email address. Enter that code on the field bellow to
            validate your registration on SkyUp.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <section className="bg-amber-100 p-4 mx-3 border-l-4 border-red-700 rounded-bl-[2px] rounded-tl-[2px]">
              <FieldError error={submitError} />
            </section>
          )}
          <CardContent className="flex justify-center">
            <InputOTP
              maxLength={6}
              onChange={(value) => setCode(value)}
              spellCheck="false"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </CardContent>
          <CardFooter className="mt-5">
            <Button
              className="w-full"
              type="submit"
              disabled={mutation.isPending || code.length !== 6}
            >
              {mutation.isPending ? (
                <LoaderIcon className="animate-spin size-5 stroke-[3px]" />
              ) : (
                'Verify account'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
