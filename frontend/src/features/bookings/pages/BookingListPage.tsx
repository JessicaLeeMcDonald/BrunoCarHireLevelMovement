import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { useCancelBooking, useCompleteBooking, useDeleteBooking } from '../hooks/useBookingMutations';
import { useQueryParamsState } from '../../../shared/hooks/useQueryParamsState';
import { BookingFilters } from '../components/BookingFilters';
import { BookingStatusBadge } from '../components/BookingStatusBadge';
import { DataTable } from '../../../shared/components/DataTable';
import type { DataTableColumn } from '../../../shared/components/DataTable';
import { Pagination } from '../../../shared/components/Pagination';
import { useDialog } from '../../../shared/hooks/useDialog';
import { useToast } from '../../../shared/components/Toast/useToast';
import { formatCurrency } from '../../../shared/utils/currency';
import { formatDate } from '../../../shared/utils/date';
import type { Booking } from '../types/model';
import type { BookingStatus } from '../types/dto';
import { normalizeError } from '../../../shared/api/apiError';
import { useVehicles } from '../../vehicles/hooks/useVehicles';
import { useCustomers } from '../../customers/hooks/useCustomers';
import { customerFullName } from '../../customers/types/model';

const DEFAULT_FILTERS = {
  pageNumber: 1,
  pageSize: 10,
  status: '' as BookingStatus | '',
  vehicleId: '',
  customerId: '',
};

export function BookingListPage() {
  const [filters, setFilters] = useQueryParamsState(DEFAULT_FILTERS);
  const navigate = useNavigate();
  const { confirm } = useDialog();
  const { showToast } = useToast();

  const { data, isLoading, isFetching } = useBookings({
    pageNumber: filters.pageNumber,
    pageSize: filters.pageSize,
    status: filters.status || undefined,
    vehicleId: filters.vehicleId || undefined,
    customerId: filters.customerId || undefined,
  });

  const { data: vehiclesData } = useVehicles({ pageNumber: 1, pageSize: 100, includeDeleted: true });
  const { data: customersData } = useCustomers({ pageNumber: 1, pageSize: 100 });

  const vehicleById = useMemo(() => new Map(vehiclesData?.items.map((v) => [v.id, v])), [vehiclesData]);
  const customerById = useMemo(() => new Map(customersData?.items.map((c) => [c.id, c])), [customersData]);

  const cancelBooking = useCancelBooking();
  const completeBooking = useCompleteBooking();
  const deleteBooking = useDeleteBooking();

  async function handleCancel(booking: Booking) {
    const confirmed = await confirm({
      title: 'Cancel booking',
      message: 'Cancel this booking? The customer will need to make a new reservation if they still want the vehicle.',
      confirmLabel: 'Cancel booking',
      danger: true,
    });
    if (!confirmed) return;

    try {
      await cancelBooking.mutateAsync(booking.id);
      showToast('Booking cancelled.', 'success');
    } catch (error) {
      showToast(normalizeError(error).firstMessage, 'error');
    }
  }

  async function handleComplete(booking: Booking) {
    try {
      await completeBooking.mutateAsync(booking.id);
      showToast('Booking marked as completed.', 'success');
    } catch (error) {
      showToast(normalizeError(error).firstMessage, 'error');
    }
  }

  async function handleDelete(booking: Booking) {
    const confirmed = await confirm({
      title: 'Delete booking',
      message: 'Delete this booking permanently? Only future, active bookings can be deleted.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) return;

    try {
      await deleteBooking.mutateAsync(booking.id);
      showToast('Booking deleted.', 'success');
    } catch (error) {
      showToast(normalizeError(error).firstMessage, 'error');
    }
  }

  const columns: DataTableColumn<Booking>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (booking) => {
        const vehicle = vehicleById.get(booking.vehicleId);
        return vehicle ? `${vehicle.registrationNumber} — ${vehicle.make} ${vehicle.model}` : booking.vehicleId;
      },
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (booking) => {
        const customer = customerById.get(booking.customerId);
        return customer ? customerFullName(customer) : booking.customerId;
      },
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (booking) => `${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}`,
    },
    { key: 'total', header: 'Total', align: 'right', render: (booking) => formatCurrency(booking.totalPrice) },
    { key: 'status', header: 'Status', render: (booking) => <BookingStatusBadge status={booking.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (booking) => (
        <div className="row-actions">
          {booking.status === 'Active' && (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleComplete(booking)}>
                Complete
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-danger-text"
                onClick={() => handleCancel(booking)}
              >
                Cancel
              </button>
            </>
          )}
          <button type="button" className="btn btn-ghost btn-sm btn-danger-text" onClick={() => handleDelete(booking)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Bookings</h1>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/bookings/new')}>
          New booking
        </button>
      </div>

      <BookingFilters
        status={filters.status}
        vehicleId={filters.vehicleId}
        customerId={filters.customerId}
        vehicles={vehiclesData?.items ?? []}
        customers={customersData?.items ?? []}
        onChange={(next) => setFilters({ ...next, pageNumber: 1 })}
      />

      <DataTable
        columns={columns}
        items={data?.items ?? []}
        getRowKey={(booking) => booking.id}
        isLoading={isLoading}
        emptyTitle="No bookings found"
        emptyDescription="Try clearing your filters or create a new booking."
      />

      {data && (
        <Pagination
          pageNumber={data.pageNumber}
          totalPages={data.totalPages}
          onPageChange={(page) => setFilters({ pageNumber: page })}
        />
      )}
      {isFetching && !isLoading && <p className="fetching-indicator">Refreshing…</p>}
    </div>
  );
}
