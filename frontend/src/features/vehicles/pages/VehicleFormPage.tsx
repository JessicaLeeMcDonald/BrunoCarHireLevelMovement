import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { VehicleForm } from '../components/VehicleForm';
import { useVehicle } from '../hooks/useVehicles';
import { useCreateVehicle, useUpdateVehicle } from '../hooks/useVehicleMutations';
import { normalizeError } from '../../../shared/api/apiError';
import type { ApiError } from '../../../shared/api/apiError';
import { useToast } from '../../../shared/components/Toast/useToast';
import type { VehicleFormValues } from '../schemas/vehicleSchema';
import { Skeleton } from '../../../shared/components/Skeleton';

export function VehicleFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<ApiError | null>(null);

  const { data: vehicle, isLoading } = useVehicle(id);
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle(id ?? '');

  async function handleSubmit(values: VehicleFormValues) {
    setServerError(null);
    try {
      if (isEdit) {
        await updateVehicle.mutateAsync(values);
        showToast('Vehicle updated.', 'success');
      } else {
        await createVehicle.mutateAsync(values);
        showToast('Vehicle created.', 'success');
      }
      navigate('/vehicles');
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
      <h1>{isEdit ? 'Edit vehicle' : 'Add vehicle'}</h1>
      <VehicleForm
        mode={isEdit ? 'edit' : 'create'}
        initialValues={vehicle}
        onSubmit={handleSubmit}
        isSubmitting={createVehicle.isPending || updateVehicle.isPending}
        serverError={serverError}
        onCancel={() => navigate('/vehicles')}
      />
    </div>
  );
}
