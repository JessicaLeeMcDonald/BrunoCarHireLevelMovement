import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleFormSchema } from '../schemas/vehicleSchema';
import type { VehicleFormValues } from '../schemas/vehicleSchema';
import { FormField } from '../../../shared/components/FormField';
import type { Vehicle } from '../types/model';
import type { ApiError } from '../../../shared/api/apiError';
import { toAbsoluteMediaUrl } from '../../../shared/utils/media';

const KNOWN_FIELDS: (keyof VehicleFormValues)[] = ['registrationNumber', 'make', 'model', 'year', 'dailyRate'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export interface VehicleImageAction {
  file: File | null;
  remove: boolean;
}

interface VehicleFormProps {
  mode: 'create' | 'edit';
  initialValues?: Vehicle;
  onSubmit: (values: VehicleFormValues, imageAction: VehicleImageAction) => void;
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(() =>
    toAbsoluteMediaUrl(initialValues?.imageUrl),
  );

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Photo must be a JPEG, PNG or WEBP image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Photo must be 5 MB or smaller.');
      return;
    }

    setImageError(null);
    setImageFile(file);
    setRemoveImage(false);
    setPreviewUrl((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  function handleRemoveImage() {
    setImageFile(null);
    setRemoveImage(true);
    setImageError(null);
    setPreviewUrl((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return undefined;
    });
  }

  function handleFormSubmit(values: VehicleFormValues) {
    onSubmit(values, { file: imageFile, remove: removeImage });
  }

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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="form" noValidate>
      <FormField
        label="Registration number"
        htmlFor="registrationNumber"
        error={errors.registrationNumber}
        hint={mode === 'edit' ? 'Registration number cannot be changed.' : undefined}
      >
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
      <div className="form-field">
        <label htmlFor="vehicleImage">Photo</label>
        <div className="vehicle-photo-field">
          <div className="vehicle-photo-preview">
            {previewUrl ? <img src={previewUrl} alt="" /> : <span>No photo</span>}
          </div>
          <div className="vehicle-photo-actions">
            <label className="btn btn-ghost btn-sm vehicle-photo-upload">
              {previewUrl ? 'Replace photo' : 'Add photo'}
              <input
                id="vehicleImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                hidden
              />
            </label>
            {previewUrl && (
              <button type="button" className="btn btn-ghost btn-sm btn-danger-text" onClick={handleRemoveImage}>
                Remove photo
              </button>
            )}
          </div>
        </div>
        {imageError && <span className="form-error">{imageError}</span>}
        <span className="form-hint">JPEG, PNG or WEBP, up to 5 MB.</span>
      </div>
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
