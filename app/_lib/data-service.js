import { notFound } from "next/navigation";
import { eachDayOfInterval } from "date-fns";
import { cookies } from "next/headers";
import {
  getMockCabin,
  getMockCabinPrice,
  getMockCabins,
  getMockSettings,
} from "./mock-db";

const isMockMode = process.env.MOCK_MODE === "true";
const MOCK_DB_COOKIE = "wildoasis-mock-db";

async function getSupabaseClient() {
  const mod = await import("./supabase");
  return mod.supabase;
}

function getInitialMockState() {
  return {
    guests: [
      {
        id: 1,
        email: "demo@wildoasis.dev",
        fullName: "Demo Guest",
        nationality: "India",
        countryFlag: "https://flagcdn.com/in.svg",
        nationalID: "DEMO1234",
      },
    ],
    bookings: [
      {
        id: 1,
        created_at: new Date().toISOString(),
        startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        numNights: 3,
        numGuests: 2,
        totalPrice: 480,
        guestId: 1,
        cabinId: 1,
        observations: "Demo booking",
        extrasPrice: 0,
        isPaid: false,
        hasBreakfast: false,
        status: "unconfirmed",
      },
    ],
    nextBookingId: 2,
  };
}

function readMockState() {
  try {
    const store = cookies();
    const value = store.get(MOCK_DB_COOKIE)?.value;
    if (!value) return getInitialMockState();
    const parsed = JSON.parse(value);
    return {
      ...getInitialMockState(),
      ...parsed,
      guests: parsed.guests ?? getInitialMockState().guests,
      bookings: parsed.bookings ?? getInitialMockState().bookings,
      nextBookingId: parsed.nextBookingId ?? 2,
    };
  } catch {
    return getInitialMockState();
  }
}

function writeMockState(state) {
  try {
    cookies().set(MOCK_DB_COOKIE, JSON.stringify(state), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });
  } catch {
    // No request context (e.g. build-time render). Ignore writes.
  }
}

const supabaseHost = (() => {
  try {
    return new URL(process.env.SUPABASE_URL).host;
  } catch {
    return null;
  }
})();

function normalizeSupabaseImageUrl(url) {
  if (!url || !supabaseHost) return url;

  try {
    const parsed = new URL(url);
    if (parsed.host.endsWith(".supabase.co") && parsed.host !== supabaseHost) {
      parsed.host = supabaseHost;
      return parsed.toString();
    }
    return url;
  } catch {
    return url;
  }
}

/////////////
// GET

export async function getCabin(id) {
  if (isMockMode) {
    const cabin = getMockCabin(id);
    if (!cabin) notFound();
    return cabin;
  }

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("cabins")
    .select("*")
    .eq("id", id)
    .single();

  // For testing
  // await new Promise((res) => setTimeout(res, 2000));

  if (error) {
    console.error(error);
    notFound();
  }

  return { ...data, image: normalizeSupabaseImageUrl(data?.image) };
}

export async function getCabinPrice(id) {
  if (isMockMode) return getMockCabinPrice(id);

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("cabins")
    .select("regularPrice, discount")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
  }

  return data;
}

export const getCabins = async function () {
  if (isMockMode) return getMockCabins();

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("cabins")
    .select("id, name, maxCapacity, regularPrice, discount, image")
    .order("name");

  // For testing
  // await new Promise((res) => setTimeout(res, 2000));

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }

  return data.map((cabin) => ({
    ...cabin,
    image: normalizeSupabaseImageUrl(cabin.image),
  }));
};

// Guests are uniquely identified by their email address
export async function getGuest(email) {
  if (isMockMode) {
    const state = readMockState();
    return state.guests.find((guest) => guest.email === email) ?? null;
  }

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("email", email)
    .single();

  // No error here! We handle the possibility of no guest in the sign in callback
  return data;
}

export async function getBooking(id) {
  if (isMockMode) {
    const state = readMockState();
    const booking = state.bookings.find((b) => b.id === Number(id)) ?? null;
    if (!booking) throw new Error("Booking could not get loaded");
    return booking;
  }

  const supabase = await getSupabaseClient();
  const { data, error, count } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not get loaded");
  }

  return data;
}

export async function getBookings(guestId) {
  if (isMockMode) {
    const state = readMockState();
    return state.bookings
      .filter((booking) => booking.guestId === Number(guestId))
      .map((booking) => {
        const cabin = getMockCabin(booking.cabinId);
        return {
          ...booking,
          cabins: cabin ? { name: cabin.name, image: cabin.image } : null,
        };
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }

  const supabase = await getSupabaseClient();
  const { data, error, count } = await supabase
    .from("bookings")
    // We actually also need data on the cabins as well. But let's ONLY take the data that we actually need, in order to reduce downloaded data.
    .select(
      "id, created_at, startDate, endDate, numNights, numGuests, totalPrice, guestId, cabinId, cabins(name, image)"
    )
    .eq("guestId", guestId)
    .order("startDate");

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data.map((booking) => ({
    ...booking,
    cabins: booking.cabins
      ? {
          ...booking.cabins,
          image: normalizeSupabaseImageUrl(booking.cabins.image),
        }
      : booking.cabins,
  }));
}

export async function getBookedDatesByCabinId(cabinId) {
  if (isMockMode) {
    const state = readMockState();
    const data = state.bookings.filter((booking) => booking.cabinId === Number(cabinId));
    return data
      .map((booking) =>
        eachDayOfInterval({
          start: new Date(booking.startDate),
          end: new Date(booking.endDate),
        })
      )
      .flat();
  }

  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  today = today.toISOString();

  // Getting all bookings
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("cabinId", cabinId)
    .or(`startDate.gte.${today},status.eq.checked-in`);

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  // Converting to actual dates to be displayed in the date picker
  const bookedDates = data
    .map((booking) => {
      return eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      });
    })
    .flat();

  return bookedDates;
}

export async function getSettings() {
  if (isMockMode) return getMockSettings();

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.from("settings").select("*").single();

  // await new Promise((res) => setTimeout(res, 5000));

  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }

  return data;
}

export async function getCountries() {
  try {
    const res = await fetch(
      "https://restcountries.com/v2/all?fields=name,flag"
    );
    const countries = await res.json();
    return countries;
  } catch {
    throw new Error("Could not fetch countries");
  }
}

/////////////
// CREATE

export async function createGuest(newGuest) {
  if (isMockMode) {
    const state = readMockState();
    const existing = state.guests.find((guest) => guest.email === newGuest.email);
    if (existing) return existing;
    const guest = { id: state.guests.length + 1, ...newGuest };
    state.guests.push(guest);
    writeMockState(state);
    return guest;
  }

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.from("guests").insert([newGuest]);

  if (error) {
    console.error(error);
    throw new Error("Guest could not be created");
  }

  return data;
}

export async function updateGuestById(id, updatedFields) {
  if (isMockMode) {
    const state = readMockState();
    const idx = state.guests.findIndex((guest) => guest.id === Number(id));
    if (idx < 0) throw new Error("Guest could not be updated");
    state.guests[idx] = { ...state.guests[idx], ...updatedFields };
    writeMockState(state);
    return state.guests[idx];
  }

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("guests")
    .update(updatedFields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Guest could not be updated");
  return data;
}

export async function createBookingRecord(newBooking) {
  if (isMockMode) {
    const state = readMockState();
    const booking = {
      id: state.nextBookingId,
      created_at: new Date().toISOString(),
      ...newBooking,
    };
    state.nextBookingId += 1;
    state.bookings.push(booking);
    writeMockState(state);
    return booking;
  }

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .insert([newBooking])
    .select()
    .single();

  if (error) throw new Error("Booking could not be created");
  return data;
}

export async function updateBookingRecord(id, updatedFields) {
  if (isMockMode) {
    const state = readMockState();
    const idx = state.bookings.findIndex((booking) => booking.id === Number(id));
    if (idx < 0) throw new Error("Booking could not be updated");
    state.bookings[idx] = { ...state.bookings[idx], ...updatedFields };
    writeMockState(state);
    return state.bookings[idx];
  }

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .update(updatedFields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Booking could not be updated");
  return data;
}

export async function deleteBookingRecord(id) {
  if (isMockMode) {
    const state = readMockState();
    const nextBookings = state.bookings.filter((booking) => booking.id !== Number(id));
    if (nextBookings.length === state.bookings.length)
      throw new Error("Booking could not be deleted");
    state.bookings = nextBookings;
    writeMockState(state);
    return;
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw new Error("Booking could not be deleted");
}
/*
export async function createBooking(newBooking) {
  const { data, error } = await supabase
    .from("bookings")
    .insert([newBooking])
    // So that the newly created object gets returned!
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be created");
  }

  return data;
}
*/
/////////////
// UPDATE

/*
// The updatedFields is an object which should ONLY contain the updated data
export async function updateGuest(id, updatedFields) {
  const { data, error } = await supabase
    .from("guests")
    .update(updatedFields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }
  return data;
}

export async function updateBooking(id, updatedFields) {
  const { data, error } = await supabase
    .from("bookings")
    .update(updatedFields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  return data;
}

/////////////
// DELETE

export async function deleteBooking(id) {
  const { data, error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }
  return data;
}
*/
