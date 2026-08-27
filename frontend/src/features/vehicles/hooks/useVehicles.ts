import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '../api/vehiclesApi';
import type { VehicleListParams } from '../api/vehiclesApi';
import { vehicleKeys } from './queryKeys';
import { toVehicleModel } from '../types/model';
import type { PagedResult } from '../../../shared/api/types';
import type { Vehicle } from '../types/model';

export function useVehicles(filters: VehicleListParams) {
  return useQuery({
    queryKey: vehicleKeys.list(filters),
    queryFn: () => vehiclesApi.getVehicles(filters),
    select: (data): PagedResult<Vehicle> => ({ ...data, items: data.items.map(toVehicleModel) }),
    placeholderData: keepPreviousData,
  });
}

export function useVehicle(id: string | undefined) {
  return useQuery({
    queryKey: vehicleKeys.detail(id ?? ''),
    queryFn: () => vehiclesApi.getVehicle(id as string),
    select: toVehicleModel,
    enabled: Boolean(id),
  });
}
