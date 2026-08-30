export interface VehicleDto {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  isDeleted: boolean;
  createdDate: string;
  imageUrl: string | null;
}
