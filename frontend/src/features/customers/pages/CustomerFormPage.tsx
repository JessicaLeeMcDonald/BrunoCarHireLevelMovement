import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CustomerForm } from '../components/CustomerForm';
import { useCustomer } from '../hooks/useCustomers';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useCustomerMutations';
import { normalizeError } from '../../../shared/api/apiError';
import type { ApiError } from '../../../shared/api/apiError';
import { useToast } from '../../../shared/components/Toast/useToast';
import type { CustomerFormValues } from '../schemas/customerSchema';
import { Skeleton } from '../../../shared/components/Skeleton';
import { Breadcrumb } from '../../../shared/components/Breadcrumb';

export function CustomerFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<ApiError | null>(null);

  const { data: customer, isLoading } = useCustomer(id);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer(id ?? '');

  async function handleSubmit(values: CustomerFormValues) {
    setServerError(null);
    try {
      if (isEdit) {
        await updateCustomer.mutateAsync({
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
        });
        showToast('Customer updated.', 'success');
      } else {
        await createCustomer.mutateAsync(values);
        showToast('Customer created.', 'success');
      }
      navigate('/customers');
    } catch (error) {
      const apiError = normalizeError(error);
      setServerError(apiError);
      if (Object.keys(apiError.fieldErrors).length === 0) {
        showToast(apiError.firstMessage, 'error');
      }
    }
  }

  if (isEdit && isLoading) {
    return (
      <div className="page">
        <Skeleton height="2rem" width="12rem" />
        <Skeleton height="20rem" />
      </div>
    );
  }

  return (
    <div className="page">
      <Breadcrumb items={[{ label: 'Customers', to: '/customers' }, { label: isEdit ? 'Edit customer' : 'Add customer' }]} />
      <h1>{isEdit ? 'Edit customer' : 'Add customer'}</h1>
      <CustomerForm
        mode={isEdit ? 'edit' : 'create'}
        initialValues={customer}
        onSubmit={handleSubmit}
        isSubmitting={createCustomer.isPending || updateCustomer.isPending}
        serverError={serverError}
        onCancel={() => navigate('/customers')}
      />
    </div>
  );
}
