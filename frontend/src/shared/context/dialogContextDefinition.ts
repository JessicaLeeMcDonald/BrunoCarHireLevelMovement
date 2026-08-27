import { createContext } from 'react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export interface DialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const DialogContext = createContext<DialogContextValue | undefined>(undefined);
