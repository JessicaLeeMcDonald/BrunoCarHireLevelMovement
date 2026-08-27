import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { ToastProvider } from '../shared/components/Toast/ToastProvider';
import { DialogProvider } from '../shared/context/DialogContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <DialogProvider>{children}</DialogProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
