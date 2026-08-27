import { z } from 'zod';

export const customerFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(100),
  phoneNumber: z.string().trim().min(1, 'Phone number is required').max(20),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
