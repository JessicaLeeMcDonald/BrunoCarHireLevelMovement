import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVehicles } from '../../vehicles/hooks/useVehicles';
import { formatCurrency } from '../../../shared/utils/currency';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EmptyState } from '../../../shared/components/EmptyState';
import { toIsoDate } from '../../../shared/utils/date';
import { toAbsoluteMediaUrl } from '../../../shared/utils/media';
import { DatePicker } from '../../../shared/components/DatePicker';
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

  const fleetCount = lotData?.totalCount ?? 0;
  const availableCount = availableNowData?.totalCount ?? availableNowData?.items.length ?? 0;
  const bannerItems = [
    fleetCount > 0 ? `${fleetCount} vehicle${fleetCount === 1 ? '' : 's'} in the Bruno fleet` : 'Fresh wheels, fair prices',
    `${availableCount} available to book right now`,
    'Same-day bookings, no hidden fees',
    'Free tank of gas at pick-up',
  ];

  function handleCheckAvailability(event: FormEvent) {
    event.preventDefault();
    if (!pickupInput || !returnInput) return;
    setCommittedSearch({ make: makeInput.trim(), from: pickupInput, to: returnInput });
  }

  function renderLotCard(vehicle: Vehicle, isAvailable: boolean) {
    return (
      <div key={vehicle.id} className="lot-card">
        <div className="lot-card-image">
          {vehicle.imageUrl ? (
            <img src={toAbsoluteMediaUrl(vehicle.imageUrl)} alt={`${vehicle.make} ${vehicle.model}`} />
          ) : (
            <span aria-hidden="true">vehicle photo</span>
          )}
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
          className="btn btn-ghost btn-sm"
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
        <div className="home-tagline-divider" aria-hidden="true" />
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
            <DatePicker
              id="quickbook-pickup"
              min={today}
              value={pickupInput}
              onChange={setPickupInput}
              rangeStart={pickupInput}
              rangeEnd={returnInput}
            />
          </div>
          <div className="quickbook-field">
            <label htmlFor="quickbook-return">Return date</label>
            <DatePicker
              id="quickbook-return"
              min={pickupInput || today}
              value={returnInput}
              onChange={setReturnInput}
              rangeStart={pickupInput}
              rangeEnd={returnInput}
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

      <div className="home-banner">
        <div className="home-banner-track">
          <div className="home-banner-list">
            {bannerItems.map((item) => (
              <span className="home-banner-item" key={item}>
                {item}
              </span>
            ))}
          </div>
          <div className="home-banner-list" aria-hidden="true">
            {bannerItems.map((item, index) => (
              <span className="home-banner-item" key={index}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
