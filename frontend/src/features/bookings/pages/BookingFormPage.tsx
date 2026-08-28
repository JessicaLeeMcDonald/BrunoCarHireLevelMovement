import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookingForm } from '../components/BookingForm';
import { useCreateBooking } from '../hooks/useBookingMutations';
import { useVehicles } from '../../vehicles/hooks/useVehicles';
import { useCustomers } from '../../customers/hooks/useCustomers';
import { normalizeError } from '../../../shared/api/apiError';
import type { ApiError } from '../../../shared/api/apiError';
import { useToast } from '../../../shared/components/Toast/useToast';
import type { BookingFormValues } from '../schemas/bookingSchema';
import { Skeleton } from '../../../shared/components/Skeleton';
import { Breadcrumb } from '../../../shared/components/Breadcrumb';

export function BookingFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicleId') ?? undefined;
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<ApiError | null>(null);

  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles({ pageNumber: 1, pageSize: 100 });
  const { data: customersData, isLoading: customersLoading } = useCustomers({ pageNumber: 1, pageSize: 100 });
  const createBooking = useCreateBooking();

  async function handleSubmit(values: BookingFormValues) {
    setServerError(null);
    try {
      await createBooking.mutateAsync(values);
      showToast('Booking created.', 'success');
      navigate('/bookings');
    } catch (error) {
      const apiError = normalizeError(error);
      setServerError(apiError);
      if (Object.keys(apiError.fieldErrors).length === 0) {
        showToast(apiError.firstMessage, 'error');
      }
    }
  }

  if (vehiclesLoading || customersLoading) {
    return (
      <div className="page">
        <Skeleton height="2rem" width="12rem" />
        <Skeleton height="26rem" />
      </div>
    );
  }

  return (
    <div className="page">
      <Breadcrumb items={[{ label: 'Bookings', to: '/bookings' }, { label: 'New booking' }]} />
      <h1>New booking</h1>
      <BookingForm
        vehicles={vehiclesData?.items ?? []}
        customers={customersData?.items ?? []}
        initialVehicleId={preselectedVehicleId}
        onSubmit={handleSubmit}
        isSubmitting={createBooking.isPending}
        serverError={serverError}
        onCancel={() => navigate('/bookings')}
      />
    </div>
  );
}
