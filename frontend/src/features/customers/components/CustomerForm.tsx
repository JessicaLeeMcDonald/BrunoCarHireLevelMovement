import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerFormSchema } from '../schemas/customerSchema';
import type { CustomerFormValues } from '../schemas/customerSchema';
import { FormField } from '../../../shared/components/FormField';
import type { Customer } from '../types/model';
import type { ApiError } from '../../../shared/api/apiError';

const KNOWN_FIELDS: (keyof CustomerFormValues)[] = ['firstName', 'lastName', 'email', 'phoneNumber'];

interface CustomerFormProps {
  mode: 'create' | 'edit';
  initialValues?: Customer;
  onSubmit: (values: CustomerFormValues) => void;
  isSubmitting: boolean;
  serverError?: ApiError | null;
  onCancel: () => void;
}

export function CustomerForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting,
  serverError,
  onCancel,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: initialValues
      ? {
          firstName: initialValues.firstName,
          lastName: initialValues.lastName,
          email: initialValues.email,
          phoneNumber: initialValues.phoneNumber,
        }
      : { firstName: '', lastName: '', email: '', phoneNumber: '' },
  });

  useEffect(() => {
    if (!serverError) return;

    for (const [field, messages] of Object.entries(serverError.fieldErrors)) {
      if ((KNOWN_FIELDS as string[]).includes(field)) {
        setError(field as keyof CustomerFormValues, { message: messages[0] });
      }
    }
  }, [serverError, setError]);

  const hasUnmappedServerError = Boolean(serverError) && Object.keys(serverError?.fieldErrors ?? {}).length === 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form" noValidate>
      <FormField label="First name" htmlFor="firstName" error={errors.firstName}>
        <input id="firstName" {...register('firstName')} />
      </FormField>
      <FormField label="Last name" htmlFor="lastName" error={errors.lastName}>
        <input id="lastName" {...register('lastName')} />
      </FormField>
      <FormField
        label="Email"
        htmlFor="email"
        error={errors.email}
        hint={mode === 'edit' ? 'Email cannot be changed.' : undefined}
      >
        <input id="email" type="email" {...register('email')} disabled={mode === 'edit'} />
      </FormField>
      <FormField label="Phone number" htmlFor="phoneNumber" error={errors.phoneNumber}>
        <input id="phoneNumber" {...register('phoneNumber')} />
      </FormField>
      {hasUnmappedServerError && <p className="form-error-banner">{serverError?.firstMessage}</p>}
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create customer' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
