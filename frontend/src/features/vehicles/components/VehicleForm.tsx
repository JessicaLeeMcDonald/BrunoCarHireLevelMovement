import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleFormSchema } from '../schemas/vehicleSchema';
import type { VehicleFormValues } from '../schemas/vehicleSchema';
import { FormField } from '../../../shared/components/FormField';
import type { Vehicle } from '../types/model';
import type { ApiError } from '../../../shared/api/apiError';

const KNOWN_FIELDS: (keyof VehicleFormValues)[] = ['registrationNumber', 'make', 'model', 'year', 'dailyRate'];

interface VehicleFormProps {
  mode: 'create' | 'edit';
  initialValues?: Vehicle;
  onSubmit: (values: VehicleFormValues) => void;
  isSubmitting: boolean;
  serverError?: ApiError | null;
  onCancel: () => void;
}

export function VehicleForm({ mode, initialValues, onSubmit, isSubmitting, serverError, onCancel }: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: initialValues
      ? {
          registrationNumber: initialValues.registrationNumber,
          make: initialValues.make,
          model: initialValues.model,
          year: initialValues.year,
          dailyRate: initialValues.dailyRate,
        }
      : { registrationNumber: '', make: '', model: '', year: new Date().getFullYear(), dailyRate: 0 },
  });

  useEffect(() => {
    if (!serverError) return;

    for (const [field, messages] of Object.entries(serverError.fieldErrors)) {
      if ((KNOWN_FIELDS as string[]).includes(field)) {
        setError(field as keyof VehicleFormValues, { message: messages[0] });
      }
    }
  }, [serverError, setError]);

  const hasUnmappedServerError = Boolean(serverError) && Object.keys(serverError?.fieldErrors ?? {}).length === 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form" noValidate>
      <FormField label="Registration number" htmlFor="registrationNumber" error={errors.registrationNumber}>
        <input id="registrationNumber" {...register('registrationNumber')} disabled={mode === 'edit'} />
      </FormField>
      <FormField label="Make" htmlFor="make" error={errors.make}>
        <input id="make" {...register('make')} />
      </FormField>
      <FormField label="Model" htmlFor="model" error={errors.model}>
        <input id="model" {...register('model')} />
      </FormField>
      <FormField label="Year" htmlFor="year" error={errors.year}>
        <input id="year" type="number" {...register('year', { valueAsNumber: true })} />
      </FormField>
      <FormField label="Daily rate (ZAR)" htmlFor="dailyRate" error={errors.dailyRate}>
        <input id="dailyRate" type="number" step="0.01" {...register('dailyRate', { valueAsNumber: true })} />
      </FormField>
      {hasUnmappedServerError && <p className="form-error-banner">{serverError?.firstMessage}</p>}
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create vehicle' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
