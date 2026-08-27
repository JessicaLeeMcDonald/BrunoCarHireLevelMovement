import type { BookingStatus } from '../types/dto';

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}
