export type BookingStatus = 'Active' | 'Completed' | 'Cancelled';

export interface BookingDto {
  id: string;
  vehicleId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  createdDate: string;
}
