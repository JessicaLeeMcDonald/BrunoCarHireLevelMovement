import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingFormSchema } from '../schemas/bookingSchema';
import type { BookingFormValues } from '../schemas/bookingSchema';
import { FormField } from '../../../shared/components/FormField';
import { DateRangeField } from '../../../shared/components/DateRangeField';
import type { ApiError } from '../../../shared/api/apiError';
import type { Vehicle } from '../../vehicles/types/model';
import type { Customer } from '../../customers/types/model';
import { customerFullName } from '../../customers/types/model';
import { formatCurrency } from '../../../shared/utils/currency';
import { toIsoDate } from '../../../shared/utils/date';

interface BookingFormProps {
  vehicles: Vehicle[];
  customers: Customer[];
  initialVehicleId?: string;
  onSubmit: (values: BookingFormValues) => void;
  isSubmitting: boolean;
  serverError?: ApiError | null;
  onCancel: () => void;
}

export function BookingForm({
  vehicles,
  customers,
  initialVehicleId,
  onSubmit,
  isSubmitting,
  serverError,
  onCancel,
}: BookingFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { vehicleId: initialVehicleId ?? '', customerId: '', startDate: '', endDate: '' },
  });

  useEffect(() => {
    if (!serverError) return;

    if (serverError.fieldErrors.vehicleId) {
      setError('vehicleId', { message: serverError.fieldErrors.vehicleId[0] });
    }
    if (serverError.fieldErrors.endDate) {
      setError('endDate', { message: serverError.fieldErrors.endDate[0] });
    }
  }, [serverError, setError]);

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const today = toIsoDate(new Date());

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form" noValidate>
      <FormField label="Vehicle" htmlFor="vehicleId" error={errors.vehicleId}>
        <select id="vehicleId" {...register('vehicleId')}>
          <option value="">Select a vehicle…</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.registrationNumber} — {vehicle.make} {vehicle.model} ({formatCurrency(vehicle.dailyRate)}/day)
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Customer" htmlFor="customerId" error={errors.customerId}>
        <select id="customerId" {...register('customerId')}>
          <option value="">Select a customer…</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customerFullName(customer)}
            </option>
          ))}
        </select>
      </FormField>
      <DateRangeField
        startValue={startDate}
        endValue={endDate}
        onStartChange={(value) => setValue('startDate', value, { shouldValidate: true })}
        onEndChange={(value) => setValue('endDate', value, { shouldValidate: true })}
        min={today}
        startError={errors.startDate?.message}
        endError={errors.endDate?.message}
      />
      {/* Booking conflicts double-signal deliberately: field error above, banner here. */}
      {serverError && <p className="form-error-banner">{serverError.firstMessage}</p>}
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Booking…' : 'Create booking'}
        </button>
      </div>
    </form>
  );
}
