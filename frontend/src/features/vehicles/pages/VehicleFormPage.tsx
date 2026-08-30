import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { VehicleForm } from '../components/VehicleForm';
import type { VehicleImageAction } from '../components/VehicleForm';
import { useVehicle } from '../hooks/useVehicles';
import {
  useCreateVehicle,
  useUpdateVehicle,
  useUploadVehicleImage,
  useDeleteVehicleImage,
} from '../hooks/useVehicleMutations';
import { normalizeError } from '../../../shared/api/apiError';
import type { ApiError } from '../../../shared/api/apiError';
import { useToast } from '../../../shared/components/Toast/useToast';
import type { VehicleFormValues } from '../schemas/vehicleSchema';
import { Skeleton } from '../../../shared/components/Skeleton';
import { Breadcrumb } from '../../../shared/components/Breadcrumb';

export function VehicleFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<ApiError | null>(null);

  const { data: vehicle, isLoading } = useVehicle(id);
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle(id ?? '');
  const uploadVehicleImage = useUploadVehicleImage();
  const deleteVehicleImage = useDeleteVehicleImage();

  async function handleSubmit(values: VehicleFormValues, imageAction: VehicleImageAction) {
    setServerError(null);
    try {
      const vehicleId = isEdit ? id! : (await createVehicle.mutateAsync(values)).id;
      if (isEdit) {
        await updateVehicle.mutateAsync(values);
      }

      if (imageAction.file) {
        await uploadVehicleImage.mutateAsync({ id: vehicleId, file: imageAction.file });
      } else if (imageAction.remove) {
        await deleteVehicleImage.mutateAsync(vehicleId);
      }

      showToast(isEdit ? 'Vehicle updated.' : 'Vehicle created.', 'success');
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
      <Breadcrumb items={[{ label: 'Vehicles', to: '/vehicles' }, { label: isEdit ? 'Edit vehicle' : 'Add vehicle' }]} />
      <h1>{isEdit ? 'Edit vehicle' : 'Add vehicle'}</h1>
      <VehicleForm
        mode={isEdit ? 'edit' : 'create'}
        initialValues={vehicle}
        onSubmit={handleSubmit}
        isSubmitting={
          createVehicle.isPending ||
          updateVehicle.isPending ||
          uploadVehicleImage.isPending ||
          deleteVehicleImage.isPending
        }
        serverError={serverError}
        onCancel={() => navigate('/vehicles')}
      />
    </div>
  );
}
