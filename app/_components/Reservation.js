import { auth } from "../_lib/auth";
import { getBookedDatesByCabinId, getSettings } from "../_lib/data-service";
import DateSelector from "./DateSelector";
import LoginMessage from "./LoginMessage";
import ReservationForm from "./ReservationForm";
import Spinner from "./Spinner";

async function Reservation({ cabin }) {
  let settings, bookedDates, error;

  try {
    [settings, bookedDates] = await Promise.all([
      getSettings(),
      getBookedDatesByCabinId(cabin.id),
    ]);
  } catch (err) {
    console.error("Error loading reservation data:", err);
    error = err;
  }

  const session = await auth();

  if (error) {
    return (
      <div className="grid place-items-center min-h-[400px] border border-primary-800">
        <p className="text-lg text-red-500">
          Sorry, we couldn&apos;t load the reservation system. Please try again
          later.
        </p>
      </div>
    );
  }

  if (!settings || !bookedDates) {
    return (
      <div className="grid place-items-center min-h-[400px] border border-primary-800">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 border border-primary-800 min-h-[400px]">
      <DateSelector
        settings={settings}
        bookedDates={bookedDates}
        cabin={cabin}
      />
      {session?.user ? (
        <ReservationForm cabin={cabin} user={session.user} />
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}

export default Reservation;
