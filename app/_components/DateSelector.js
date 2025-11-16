"use client";

import {
  differenceInDays,
  isPast,
  isSameDay,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useReservation } from "./ReservationContext";

function isAlreadyBooked(range, datesArr) {
  if (!range?.from || !range?.to || !datesArr?.length) return false;

  return datesArr.some((date) =>
    isWithinInterval(new Date(date), {
      start: new Date(range.from),
      end: new Date(range.to),
    })
  );
}

function DateSelector({ settings, cabin, bookedDates = [] }) {
  const { range, setRange, resetRange } = useReservation();

  const displayRange = isAlreadyBooked(range, bookedDates) ? {} : range;

  const { regularPrice, discount } = cabin;
  const numNights =
    displayRange?.from && displayRange?.to
      ? differenceInDays(new Date(displayRange.to), new Date(displayRange.from))
      : 0;
  const cabinPrice = numNights * (regularPrice - discount);

  const { minBookingLength = 1, maxBookingLength = 30 } = settings || {};

  // Convert booked dates to actual Date objects and ensure they're valid
  const validBookedDates =
    bookedDates
      ?.map((date) => {
        const dateObj = new Date(date);
        return isNaN(dateObj) ? null : dateObj;
      })
      .filter(Boolean) || [];

  const today = startOfDay(new Date());

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-8">
        <DayPicker
          className="!mx-auto bg-primary-800/50 p-4 rounded-lg"
          mode="range"
          onSelect={setRange}
          selected={displayRange}
          min={minBookingLength}
          max={maxBookingLength}
          fromMonth={today}
          fromDate={today}
          toYear={today.getFullYear() + 5}
          captionLayout="dropdown"
          numberOfMonths={2}
          disabled={(date) => {
            const day = startOfDay(date);
            return (
              (isPast(day) && !isSameDay(day, today)) ||
              validBookedDates.some((bookedDate) => isSameDay(bookedDate, day))
            );
          }}
          modifiers={{
            booked: validBookedDates,
          }}
          modifiersStyles={{
            booked: {
              backgroundColor: "#2c3d4f",
              color: "#b7c7d7",
              opacity: 0.5,
            },
          }}
          styles={{
            caption: { color: "#d2af84" },
            head_cell: { color: "#b7c7d7" },
            day: {
              color: "#d4dee7",
              fontWeight: "500",
            },
            day_selected: {
              backgroundColor: "#c69963",
              color: "#1b2631",
            },
            day_today: {
              color: "#d2af84",
              fontWeight: "600",
            },
          }}
        />
      </div>

      <div className="bg-accent-500 text-primary-800 p-6">
        <div className="flex flex-wrap items-baseline gap-4">
          <p className="flex items-baseline gap-2">
            {discount > 0 ? (
              <>
                <span className="text-2xl font-semibold">
                  ${regularPrice - discount}
                </span>
                <span className="line-through text-primary-700">
                  ${regularPrice}
                </span>
              </>
            ) : (
              <span className="text-2xl font-semibold">${regularPrice}</span>
            )}
            <span className="text-sm">/night</span>
          </p>
          {numNights > 0 && (
            <>
              <p className="bg-accent-600 px-3 py-1 rounded text-xl">
                &times; {numNights}
              </p>
              <p>
                <span className="text-sm font-bold uppercase">Total</span>{" "}
                <span className="text-2xl font-semibold">${cabinPrice}</span>
              </p>
            </>
          )}
        </div>

        {displayRange?.from || displayRange?.to ? (
          <button
            type="button"
            className="mt-4 border border-primary-800 py-2 px-4 text-sm font-semibold hover:bg-accent-600 transition-colors rounded"
            onClick={resetRange}
          >
            Clear dates
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default DateSelector;
