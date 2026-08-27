import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookingsApi';
import type { CreateBookingInput } from '../api/bookingsApi';
import { bookingKeys } from './queryKeys';
import { vehicleKeys } from '../../vehicles/hooks/queryKeys';

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingsApi.createBooking(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
  });
}

function useBookingStatusMutation(action: (id: string) => Promise<void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
  });
}

export function useCancelBooking() {
  return useBookingStatusMutation(bookingsApi.cancelBooking);
}

export function useCompleteBooking() {
  return useBookingStatusMutation(bookingsApi.completeBooking);
}

export function useDeleteBooking() {
  return useBookingStatusMutation(bookingsApi.deleteBooking);
}
