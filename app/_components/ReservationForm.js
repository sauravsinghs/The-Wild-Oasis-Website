"use client";

import { useReservation } from "./ReservationContext";
import { differenceInDays } from "date-fns";
import { createBooking } from "../_lib/actions";

function ReservationForm({ cabin, user }) {
  const { range } = useReservation();
  const { maxCapacity, regularPrice, discount, id } = cabin;
  const startDate = range?.from ? new Date(range.from).toISOString() : "";
  const endDate = range?.to ? new Date(range.to).toISOString() : "";
  const numNights =
    range?.from && range?.to
      ? differenceInDays(new Date(range.to), new Date(range.from))
      : 0;
  const cabinPrice = numNights * (regularPrice - discount);
  const bookingData = {
    cabinId: id,
    startDate,
    endDate,
    numNights,
    cabinPrice,
  };

  return (
    <div className="p-8 space-y-6">
      <div className="bg-primary-800/50 px-6 py-4 rounded-lg flex justify-between items-center text-primary-200">
        <p>Logged in as</p>
        <div className="flex gap-4 items-center">
          <div className="h-8 w-8 rounded-full bg-accent-500 grid place-items-center text-primary-900 font-semibold">
            {user.name[0].toUpperCase()}
          </div>
          <p>{user.name}</p>
        </div>
      </div>

      <form action={createBooking.bind(null, bookingData)} className="space-y-6">
        <input type="hidden" name="startDate" value={startDate} />
        <input type="hidden" name="endDate" value={endDate} />
        <input type="hidden" name="numNights" value={numNights} />
        <input type="hidden" name="cabinPrice" value={cabinPrice} />
        <div className="space-y-2">
          <label htmlFor="numGuests" className="block text-primary-200">
            Number of guests
          </label>
          <select
            name="numGuests"
            id="numGuests"
            className="w-full px-4 py-2 bg-primary-800/50 text-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
            required
          >
            <option value="">Select number of guests...</option>
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num} className="bg-primary-900">
                {num} {num === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="observations" className="block text-primary-200">
            Additional notes
          </label>
          <textarea
            name="observations"
            id="observations"
            rows={4}
            className="w-full px-4 py-2 bg-primary-800/50 text-primary-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent-500"
            placeholder="Any special requirements, allergies, or preferences?"
          />
        </div>

        <div className="pt-4">
          <button
            disabled={!range.from || !range.to}
            className="w-full bg-accent-500 text-primary-900 py-3 px-6 rounded-lg font-semibold hover:bg-accent-400 transition-colors disabled:bg-primary-700 disabled:text-primary-300 disabled:cursor-not-allowed"
          >
            {range.from && range.to
              ? "Complete reservation"
              : "Select dates first"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReservationForm;
