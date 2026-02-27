'use client';

import React from 'react';
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { UserX } from 'lucide-react';

export default function UnfollowDialog({
  to_unfollow_name,
  confirmFn,
}: {
  to_unfollow_name: string;
  confirmFn: () => void;
}) {
  const handleConfirmation = () => confirmFn();

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogMedia>
          <UserX />
        </AlertDialogMedia>
        <AlertDialogTitle>Unfollow {to_unfollow_name}?</AlertDialogTitle>
        <AlertDialogDescription>
          His posts will not appear in you news feed anymore. However, you will
          be able to see his profile unless his posts are protected.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleConfirmation}>
          Unfollow
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
