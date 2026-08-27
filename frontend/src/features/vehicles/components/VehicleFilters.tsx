import { useEffect, useState } from 'react';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';

interface VehicleFiltersProps {
  make: string;
  model: string;
  availableOnly: boolean;
  onTextFiltersChange: (filters: { make: string; model: string }) => void;
  onAvailableOnlyChange: (availableOnly: boolean) => void;
}

export function VehicleFilters({
  make,
  model,
  availableOnly,
  onTextFiltersChange,
  onAvailableOnlyChange,
}: VehicleFiltersProps) {
  const [makeInput, setMakeInput] = useState(make);
  const [modelInput, setModelInput] = useState(model);
  const debouncedMake = useDebouncedValue(makeInput);
  const debouncedModel = useDebouncedValue(modelInput);

  useEffect(() => {
    onTextFiltersChange({ make: debouncedMake, model: debouncedModel });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMake, debouncedModel]);

  return (
    <div className="filters-bar">
      <input
        type="search"
        placeholder="Filter by make…"
        value={makeInput}
        onChange={(event) => setMakeInput(event.target.value)}
        aria-label="Filter by make"
      />
      <input
        type="search"
        placeholder="Filter by model…"
        value={modelInput}
        onChange={(event) => setModelInput(event.target.value)}
        aria-label="Filter by model"
      />
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={(event) => onAvailableOnlyChange(event.target.checked)}
        />
        Available only
      </label>
    </div>
  );
}
