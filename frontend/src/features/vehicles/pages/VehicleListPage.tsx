import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { useSoftDeleteVehicle } from '../hooks/useVehicleMutations';
import { useQueryParamsState } from '../../../shared/hooks/useQueryParamsState';
import { VehicleFilters } from '../components/VehicleFilters';
import { DataTable } from '../../../shared/components/DataTable';
import type { DataTableColumn } from '../../../shared/components/DataTable';
import { Pagination } from '../../../shared/components/Pagination';
import { useDialog } from '../../../shared/hooks/useDialog';
import { useToast } from '../../../shared/components/Toast/useToast';
import { formatCurrency } from '../../../shared/utils/currency';
import { toAbsoluteMediaUrl } from '../../../shared/utils/media';
import type { Vehicle } from '../types/model';
import { normalizeError } from '../../../shared/api/apiError';

const DEFAULT_FILTERS = { pageNumber: 1, pageSize: 10, make: '', model: '', availableOnly: false };

export function VehicleListPage() {
  const [filters, setFilters] = useQueryParamsState(DEFAULT_FILTERS);
  const navigate = useNavigate();
  const { confirm } = useDialog();
  const { showToast } = useToast();

  const { data, isLoading, isFetching } = useVehicles({
    pageNumber: filters.pageNumber,
    pageSize: filters.pageSize,
    make: filters.make || undefined,
    model: filters.model || undefined,
    availableOnly: filters.availableOnly || undefined,
  });

  const softDeleteVehicle = useSoftDeleteVehicle();

  const handleTextFiltersChange = useCallback(
    (next: { make: string; model: string }) => setFilters({ ...next, pageNumber: 1 }),
    [setFilters],
  );

  async function handleDelete(vehicle: Vehicle) {
    const confirmed = await confirm({
      title: 'Remove vehicle',
      message: `Remove ${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber}) from the fleet? It can no longer be booked once removed.`,
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!confirmed) return;

    try {
      await softDeleteVehicle.mutateAsync(vehicle.id);
      showToast('Vehicle removed.', 'success');
    } catch (error) {
      showToast(normalizeError(error).firstMessage, 'error');
    }
  }

  const columns: DataTableColumn<Vehicle>[] = [
    {
      key: 'photo',
      header: '',
      render: (vehicle) => (
        <div className="table-thumb">
          {vehicle.imageUrl && (
            <img src={toAbsoluteMediaUrl(vehicle.imageUrl)} alt={`${vehicle.make} ${vehicle.model}`} />
          )}
        </div>
      ),
    },
    { key: 'registration', header: 'Registration', render: (vehicle) => vehicle.registrationNumber },
    { key: 'vehicle', header: 'Vehicle', render: (vehicle) => `${vehicle.make} ${vehicle.model} (${vehicle.year})` },
    {
      key: 'dailyRate',
      header: 'Daily rate',
      align: 'right',
      render: (vehicle) => formatCurrency(vehicle.dailyRate),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (vehicle) => (
        <div className="row-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-danger-text"
            onClick={() => handleDelete(vehicle)}
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Vehicles</h1>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/vehicles/new')}>
          Add vehicle
        </button>
      </div>

      <VehicleFilters
        make={filters.make}
        model={filters.model}
        availableOnly={filters.availableOnly}
        onTextFiltersChange={handleTextFiltersChange}
        onAvailableOnlyChange={(availableOnly) => setFilters({ availableOnly, pageNumber: 1 })}
      />

      <DataTable
        columns={columns}
        items={data?.items ?? []}
        getRowKey={(vehicle) => vehicle.id}
        isLoading={isLoading}
        emptyTitle="No vehicles found"
        emptyDescription="Try clearing your filters or add a new vehicle."
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
