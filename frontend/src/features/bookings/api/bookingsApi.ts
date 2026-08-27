import { axiosClient } from '../../../shared/api/axiosClient';
import type { PagedResult } from '../../../shared/api/types';
import type { BookingDto, BookingStatus } from '../types/dto';

export interface BookingListParams {
  pageNumber?: number;
  pageSize?: number;
  vehicleId?: string;
  customerId?: string;
  status?: BookingStatus;
  from?: string;
  to?: string;
}

export interface CreateBookingInput {
  vehicleId: string;
  customerId: string;
  startDate: string;
  endDate: string;
}

export const bookingsApi = {
  async getBookings(params: BookingListParams): Promise<PagedResult<BookingDto>> {
    const { data } = await axiosClient.get<PagedResult<BookingDto>>('/bookings', { params });
    return data;
  },

  async getBooking(id: string): Promise<BookingDto> {
    const { data } = await axiosClient.get<BookingDto>(`/bookings/${id}`);
    return data;
  },

  async createBooking(input: CreateBookingInput): Promise<BookingDto> {
    const { data } = await axiosClient.post<BookingDto>('/bookings', input);
    return data;
  },

  async cancelBooking(id: string): Promise<void> {
    await axiosClient.patch(`/bookings/${id}/cancel`);
  },

  async completeBooking(id: string): Promise<void> {
    await axiosClient.patch(`/bookings/${id}/complete`);
  },

  async deleteBooking(id: string): Promise<void> {
    await axiosClient.delete(`/bookings/${id}`);
  },
};
