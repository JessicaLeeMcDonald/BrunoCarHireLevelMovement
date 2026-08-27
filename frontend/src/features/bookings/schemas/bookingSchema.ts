import { z } from 'zod';

export const bookingFormSchema = z
  .object({
    vehicleId: z.string().min(1, 'Select a vehicle'),
    customerId: z.string().min(1, 'Select a customer'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
