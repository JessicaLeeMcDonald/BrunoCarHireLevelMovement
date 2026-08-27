import type { BookingStatus } from '../types/dto';
import type { Vehicle } from '../../vehicles/types/model';
import type { Customer } from '../../customers/types/model';
import { customerFullName } from '../../customers/types/model';

interface BookingFiltersValue {
  status: BookingStatus | '';
  vehicleId: string;
  customerId: string;
}

interface BookingFiltersProps extends BookingFiltersValue {
  vehicles: Vehicle[];
  customers: Customer[];
  onChange: (filters: BookingFiltersValue) => void;
}

const STATUS_OPTIONS: BookingStatus[] = ['Active', 'Completed', 'Cancelled'];

export function BookingFilters({
  status,
  vehicleId,
  customerId,
  vehicles,
  customers,
  onChange,
}: BookingFiltersProps) {
  return (
    <div className="filters-bar">
      <select
        value={status}
        onChange={(event) => onChange({ status: event.target.value as BookingStatus | '', vehicleId, customerId })}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select
        value={vehicleId}
        onChange={(event) => onChange({ status, vehicleId: event.target.value, customerId })}
        aria-label="Filter by vehicle"
      >
        <option value="">All vehicles</option>
        {vehicles.map((vehicle) => (
          <option key={vehicle.id} value={vehicle.id}>
            {vehicle.registrationNumber}
          </option>
        ))}
      </select>
      <select
        value={customerId}
        onChange={(event) => onChange({ status, vehicleId, customerId: event.target.value })}
        aria-label="Filter by customer"
      >
        <option value="">All customers</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customerFullName(customer)}
          </option>
        ))}
      </select>
    </div>
  );
}
