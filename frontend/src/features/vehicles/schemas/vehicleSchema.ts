import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const vehicleFormSchema = z.object({
  registrationNumber: z.string().trim().min(1, 'Registration number is required').max(20),
  make: z.string().trim().min(1, 'Make is required').max(50),
  model: z.string().trim().min(1, 'Model is required').max(50),
  year: z
    .number({ error: 'Year is required' })
    .int()
    .min(1980, 'Year must be 1980 or later')
    .max(currentYear + 1, "Year can't be in the future"),
  dailyRate: z.number({ error: 'Daily rate is required' }).positive('Daily rate must be greater than zero'),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
