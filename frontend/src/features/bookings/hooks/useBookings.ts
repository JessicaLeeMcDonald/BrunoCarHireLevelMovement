import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookingsApi';
import type { BookingListParams } from '../api/bookingsApi';
import { bookingKeys } from './queryKeys';
import { toBookingModel } from '../types/model';
import type { PagedResult } from '../../../shared/api/types';
import type { Booking } from '../types/model';

export function useBookings(filters: BookingListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => bookingsApi.getBookings(filters),
    select: (data): PagedResult<Booking> => ({ ...data, items: data.items.map(toBookingModel) }),
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ''),
    queryFn: () => bookingsApi.getBooking(id as string),
    select: toBookingModel,
    enabled: Boolean(id),
  });
}
