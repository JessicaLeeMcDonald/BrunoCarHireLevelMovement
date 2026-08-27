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
}: DateRangeFieldProps) {
  return (
    <div className="date-range-field">
      <div className="form-field">
        <label htmlFor="booking-start-date">{startLabel}</label>
        <input
          id="booking-start-date"
          type="date"
          value={startValue}
          min={min}
          onChange={(event) => onStartChange(event.target.value)}
        />
        {startError && <span className="form-error">{startError}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="booking-end-date">{endLabel}</label>
        <input
          id="booking-end-date"
          type="date"
          value={endValue}
          min={startValue || min}
          onChange={(event) => onEndChange(event.target.value)}
        />
        {endError && <span className="form-error">{endError}</span>}
      </div>
    </div>
  );
}
