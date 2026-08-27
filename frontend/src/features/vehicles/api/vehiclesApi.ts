import { axiosClient } from '../../../shared/api/axiosClient';
import type { PagedResult } from '../../../shared/api/types';
import type { VehicleDto } from '../types/dto';

export interface VehicleListParams {
  pageNumber?: number;
  pageSize?: number;
  make?: string;
  model?: string;
  availableOnly?: boolean;
  includeDeleted?: boolean;
}

export interface CreateVehicleInput {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
}

export interface UpdateVehicleInput {
  make: string;
  model: string;
  year: number;
  dailyRate: number;
}

export const vehiclesApi = {
  async getVehicles(params: VehicleListParams): Promise<PagedResult<VehicleDto>> {
    const { data } = await axiosClient.get<PagedResult<VehicleDto>>('/vehicles', { params });
    return data;
  },

  async getVehicle(id: string): Promise<VehicleDto> {
    const { data } = await axiosClient.get<VehicleDto>(`/vehicles/${id}`);
    return data;
  },

  async createVehicle(input: CreateVehicleInput): Promise<VehicleDto> {
    const { data } = await axiosClient.post<VehicleDto>('/vehicles', input);
    return data;
  },

  async updateVehicle(id: string, input: UpdateVehicleInput): Promise<VehicleDto> {
    const { data } = await axiosClient.put<VehicleDto>(`/vehicles/${id}`, input);
    return data;
  },

  async softDeleteVehicle(id: string): Promise<void> {
    await axiosClient.delete(`/vehicles/${id}`);
  },
};
