import { useEffect, useState } from 'react';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';

interface CustomerFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
}

export function CustomerFilters({ search, onSearchChange }: CustomerFiltersProps) {
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput);

  useEffect(() => {
    onSearchChange(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="filters-bar">
      <input
        type="search"
        placeholder="Search by name or email…"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        aria-label="Search customers"
      />
    </div>
  );
}
