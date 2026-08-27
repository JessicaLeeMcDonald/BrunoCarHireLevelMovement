import { useContext } from 'react';
import { DialogContext } from '../context/dialogContextDefinition';
import type { DialogContextValue } from '../context/dialogContextDefinition';

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within a DialogProvider');
  return ctx;
}
