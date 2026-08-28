import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVehicles } from '../../vehicles/hooks/useVehicles';
import { formatCurrency } from '../../../shared/utils/currency';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EmptyState } from '../../../shared/components/EmptyState';
import { toIsoDate } from '../../../shared/utils/date';
import type { Vehicle } from '../../vehicles/types/model';

interface CommittedSearch {
  make: string;
  from: string;
  to: string;
}

export function HomePage() {
  const navigate = useNavigate();
  const today = toIsoDate(new Date());

  const [makeInput, setMakeInput] = useState('');
  const [pickupInput, setPickupInput] = useState('');
  const [returnInput, setReturnInput] = useState('');
  const [committedSearch, setCommittedSearch] = useState<CommittedSearch | null>(null);

  const { data: lotData, isLoading: lotLoading } = useVehicles({ pageNumber: 1, pageSize: 3 });
  const { data: availableNowData } = useVehicles({ pageNumber: 1, pageSize: 100, availableOnly: true });

  const { data: searchResults, isFetching: searching } = useVehicles(
    {
      pageNumber: 1,
      pageSize: 20,
      make: committedSearch?.make || undefined,
      availableFrom: committedSearch?.from,
      availableTo: committedSearch?.to,
    },
    { enabled: Boolean(committedSearch) },
  );

  const availableNowIds = new Set(availableNowData?.items.map((vehicle) => vehicle.id) ?? []);

  function handleCheckAvailability(event: FormEvent) {
    event.preventDefault();
    if (!pickupInput || !returnInput) return;
    setCommittedSearch({ make: makeInput.trim(), from: pickupInput, to: returnInput });
  }

  function renderLotCard(vehicle: Vehicle, isAvailable: boolean) {
    return (
      <div key={vehicle.id} className="lot-card">
        <div className="lot-card-image" aria-hidden="true">
          vehicle photo
        </div>
        <div className="lot-card-header">
          <span className="lot-card-name">
            {vehicle.make} {vehicle.model}
          </span>
          <span className={`badge ${isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
            {isAvailable ? 'Available' : 'Out on hire'}
          </span>
        </div>
        <span className="lot-card-rate">{formatCurrency(vehicle.dailyRate)} / day</span>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={!isAvailable}
          onClick={() => navigate(`/bookings/new?vehicleId=${vehicle.id}`)}
        >
          Book this one
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="home-tagline-block">
        <h1 className="home-tagline">
          Pick your ride.
          <br />
          Book it in 30 seconds.
        </h1>
        <form className="quickbook-bar" onSubmit={handleCheckAvailability}>
          <div className="quickbook-field">
            <label htmlFor="quickbook-make">Vehicle / make</label>
            <input
              id="quickbook-make"
              value={makeInput}
              onChange={(event) => setMakeInput(event.target.value)}
              placeholder="e.g. Ford"
            />
          </div>
          <div className="quickbook-field">
            <label htmlFor="quickbook-pickup">Pick-up date</label>
            <input
              id="quickbook-pickup"
              type="date"
              min={today}
              value={pickupInput}
              onChange={(event) => setPickupInput(event.target.value)}
            />
          </div>
          <div className="quickbook-field">
            <label htmlFor="quickbook-return">Return date</label>
            <input
              id="quickbook-return"
              type="date"
              min={pickupInput || today}
              value={returnInput}
              onChange={(event) => setReturnInput(event.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Check availability
          </button>
        </form>
      </section>

      <div className="home-checker-divider" aria-hidden="true" />

      {committedSearch && (
        <section className="home-section">
          <h2 className="home-section-title">
            {searching
              ? 'Searching…'
              : `${searchResults?.totalCount ?? 0} vehicle${searchResults?.totalCount === 1 ? '' : 's'} available for those dates`}
          </h2>
          {searching ? (
            <Skeleton height="10rem" />
          ) : searchResults && searchResults.items.length > 0 ? (
            <div className="lot-grid">{searchResults.items.map((vehicle) => renderLotCard(vehicle, true))}</div>
          ) : (
            <EmptyState
              title="No vehicles available for those dates"
              description="Try a different date range or clear the make filter."
            />
          )}
        </section>
      )}

      <section className="home-section">
        <div className="page-header">
          <h2 className="home-section-title">On the lot today</h2>
          <Link to="/vehicles" className="home-see-all">
            See all vehicles →
          </Link>
        </div>
        {lotLoading ? (
          <Skeleton height="14rem" />
        ) : lotData && lotData.items.length > 0 ? (
          <div className="lot-grid">
            {lotData.items.map((vehicle) => renderLotCard(vehicle, availableNowIds.has(vehicle.id)))}
          </div>
        ) : (
          <EmptyState title="No vehicles registered yet" description="Add a vehicle to get started." />
        )}
      </section>

      <div className="home-shortcuts">
        <span>Staff shortcuts — bookings needing action, customer lookup, fleet admin</span>
        <div className="home-shortcuts-actions">
          <Link to="/bookings" className="btn btn-ghost btn-sm">
            Bookings
          </Link>
          <Link to="/customers" className="btn btn-ghost btn-sm">
            Customers
          </Link>
        </div>
      </div>
    </div>
  );
}
