import type { VehicleDto } from './dto';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  isDeleted: boolean;
  createdDate: Date;
  imageUrl: string | null;
}

export function toVehicleModel(dto: VehicleDto): Vehicle {
  return { ...dto, createdDate: new Date(dto.createdDate) };
}
