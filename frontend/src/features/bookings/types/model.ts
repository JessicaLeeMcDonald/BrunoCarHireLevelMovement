import type { BookingDto, BookingStatus } from './dto';

export interface Booking {
  id: string;
  vehicleId: string;
  customerId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: BookingStatus;
  createdDate: Date;
}

export function toBookingModel(dto: BookingDto): Booking {
  return {
    ...dto,
    startDate: new Date(dto.startDate),
    endDate: new Date(dto.endDate),
    createdDate: new Date(dto.createdDate),
  };
}
