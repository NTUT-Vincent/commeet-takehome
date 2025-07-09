'use client';

import { Toaster } from 'sonner';

export const ToastLayer = () => {
  return (
    <Toaster 
      position="top-right"
      richColors
      closeButton
      duration={4000}
    />
  );
};
