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

export default function AccountVerification() {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [code, setCode] = useState<string>('');

  return (
    <div className=" relative h-screen flex items-center justify-center">
      <div className="flex items-center gap-1 absolute top-4 left-10">
        <Image src="/logo.svg" height={30} width={30} alt="logo" />
        <p className="text-primary text-[22px] font-medium">SkyUp</p>
      </div>
      <Card className="h-fit  w-full max-w-[90vw] md:w-90">
        <CardHeader>
          <CardTitle className="text-[22px] font-bold">
            Email verification
          </CardTitle>
          <CardDescription>
            An email verificcation code have been sent to your email address.
            Enter that code on the field bellow to validate your registration on
            SkyUp.
          </CardDescription>
        </CardHeader>
        <form>
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
            <Button className="w-full" type="submit">
              {isSubmiting ? (
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
