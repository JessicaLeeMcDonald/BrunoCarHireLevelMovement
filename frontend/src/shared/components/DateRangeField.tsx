import { DatePicker } from './DatePicker';
import type { DateRange } from './DatePicker';

interface DateRangeFieldProps {
  startLabel?: string;
  endLabel?: string;
  startValue: string;
  endValue: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  min?: string;
  startError?: string;
  endError?: string;
  unavailableRanges?: DateRange[];
}

export function DateRangeField({
  startLabel = 'Start date',
  endLabel = 'End date',
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  min,
  startError,
  endError,
  unavailableRanges,
}: DateRangeFieldProps) {
  return (
    <div className="date-range-field">
      <div className="form-field">
        <label htmlFor="booking-start-date">{startLabel}</label>
        <DatePicker
          id="booking-start-date"
          value={startValue}
          onChange={onStartChange}
          min={min}
          unavailableRanges={unavailableRanges}
          hasError={Boolean(startError)}
          rangeStart={startValue}
          rangeEnd={endValue}
        />
        {startError && <span className="form-error">{startError}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="booking-end-date">{endLabel}</label>
        <DatePicker
          id="booking-end-date"
          value={endValue}
          onChange={onEndChange}
          min={startValue || min}
          unavailableRanges={unavailableRanges}
          hasError={Boolean(endError)}
          rangeStart={startValue}
          rangeEnd={endValue}
        />
        {endError && <span className="form-error">{endError}</span>}
      </div>
    </div>
  );
}
