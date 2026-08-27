import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '../api/vehiclesApi';
import type { CreateVehicleInput, UpdateVehicleInput } from '../api/vehiclesApi';
import { vehicleKeys } from './queryKeys';

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVehicleInput) => vehiclesApi.createVehicle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
  });
}

export function useUpdateVehicle(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateVehicleInput) => vehiclesApi.updateVehicle(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(id) });
    },
  });
}

export function useSoftDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vehiclesApi.softDeleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
  });
}
