import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

export interface DateRange {
  start: string;
  end: string;
}

interface DatePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  unavailableRanges?: DateRange[];
  hasError?: boolean;
  /** The other end of a start/end pair, so both ends stay visible and the span between them is shaded. */
  rangeStart?: string;
  rangeEnd?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function parseIso(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(value: string): string {
  const date = parseIso(value);
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

function getMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
}

function isUnavailable(iso: string, ranges: DateRange[]): boolean {
  return ranges.some((range) => iso >= range.start && iso <= range.end);
}

export function DatePicker({
  id,
  value,
  onChange,
  min,
  unavailableRanges = [],
  hasError,
  rangeStart,
  rangeEnd,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState(() => formatDisplay(value));
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseIso(value);
  const fallbackView = selectedDate ?? parseIso(min) ?? new Date();
  const [viewYear, setViewYear] = useState(fallbackView.getFullYear());
  const [viewMonth, setViewMonth] = useState(fallbackView.getMonth());

  useEffect(() => {
    setInputText(formatDisplay(value));
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  function openCalendar() {
    const base = selectedDate ?? parseIso(min) ?? new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setIsOpen(true);
  }

  function shiftMonth(delta: number) {
    let nextMonth = viewMonth + delta;
    let nextYear = viewYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setViewMonth(nextMonth);
    setViewYear(nextYear);
  }

  function handleTextChange(event: ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;
    setInputText(text);

    if (text.trim() === '') {
      onChange('');
      return;
    }

    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
    if (!match) return;
    const [, dd, mm, yyyy] = match;
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (date.getFullYear() === Number(yyyy) && date.getMonth() === Number(mm) - 1 && date.getDate() === Number(dd)) {
      onChange(toIso(date));
    }
  }

  function isDisabled(iso: string): boolean {
    if (min && iso < min) return true;
    return isUnavailable(iso, unavailableRanges);
  }

  function selectDate(date: Date) {
    const iso = toIso(date);
    if (isDisabled(iso)) return;
    onChange(iso);
    setIsOpen(false);
  }

  const days = getMonthGrid(viewYear, viewMonth);
  const todayIso = toIso(new Date());

  const effectiveStart = rangeStart || value || undefined;
  const effectiveEnd = rangeEnd || value || undefined;
  const rangeLo = effectiveStart && effectiveEnd ? (effectiveStart <= effectiveEnd ? effectiveStart : effectiveEnd) : effectiveStart || effectiveEnd;
  const rangeHi = effectiveStart && effectiveEnd ? (effectiveStart <= effectiveEnd ? effectiveEnd : effectiveStart) : effectiveStart || effectiveEnd;

  return (
    <div className="date-picker" ref={containerRef}>
      <div className={`date-picker-input${hasError ? ' date-picker-input-error' : ''}`}>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder="dd/mm/yyyy"
          autoComplete="off"
          value={inputText}
          onChange={handleTextChange}
          onFocus={openCalendar}
        />
        <button
          type="button"
          className="date-picker-toggle"
          aria-label="Open calendar"
          onClick={() => (isOpen ? setIsOpen(false) : openCalendar())}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" />
            <line x1="1.5" y1="6" x2="14.5" y2="6" />
            <line x1="4.5" y1="1" x2="4.5" y2="3.5" />
            <line x1="11.5" y1="1" x2="11.5" y2="3.5" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="date-picker-popover" role="dialog" aria-label="Choose a date">
          <div className="date-picker-header">
            <button type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
              ‹
            </button>
            <span className="date-picker-month-label">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" aria-label="Next month" onClick={() => shiftMonth(1)}>
              ›
            </button>
          </div>
          <div className="date-picker-weekdays">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="date-picker-grid">
            {days.map((date) => {
              const iso = toIso(date);
              const outsideMonth = date.getMonth() !== viewMonth;
              const unavailable = isUnavailable(iso, unavailableRanges);
              const disabled = isDisabled(iso);
              const isEndpoint = Boolean(rangeLo) && (iso === rangeLo || iso === rangeHi);
              const isInRange = Boolean(rangeLo && rangeHi) && iso > rangeLo! && iso < rangeHi!;
              const isToday = iso === todayIso;

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  title={unavailable ? 'Not available for this vehicle' : undefined}
                  onClick={() => selectDate(date)}
                  className={[
                    'date-picker-day',
                    outsideMonth && 'date-picker-day-outside',
                    isInRange && !isEndpoint && 'date-picker-day-in-range',
                    isEndpoint && 'date-picker-day-endpoint',
                    isToday && !isEndpoint && 'date-picker-day-today',
                    unavailable && !isEndpoint && 'date-picker-day-unavailable',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="date-picker-footer">
            <button type="button" className="date-picker-link" onClick={() => onChange('')}>
              Clear
            </button>
            <button
              type="button"
              className="date-picker-link"
              onClick={() => {
                const now = new Date();
                setViewYear(now.getFullYear());
                setViewMonth(now.getMonth());
              }}
            >
              Today
            </button>
          </div>
          {unavailableRanges.length > 0 && (
            <div className="date-picker-legend">
              <span className="date-picker-legend-swatch" aria-hidden="true" />
              Not available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
