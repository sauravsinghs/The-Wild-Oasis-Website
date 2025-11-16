const today = new Date();
const oneDay = 24 * 60 * 60 * 1000;

const placeholderImage = (label) =>
  `https://picsum.photos/seed/${encodeURIComponent(label)}/1200/800`;

const demoGuest = {
  id: 1,
  email: "demo@wildoasis.dev",
  fullName: "Demo Guest",
  nationality: "India",
  countryFlag: "https://flagcdn.com/in.svg",
  nationalID: "DEMO1234",
};

const cabins = [
  {
    id: 1,
    name: "Pine Retreat",
    maxCapacity: 3,
    regularPrice: 180,
    discount: 20,
    image: placeholderImage("pine-retreat"),
    description: "A cozy cabin surrounded by pine forests and mountain views.",
  },
  {
    id: 2,
    name: "Alpine Vista",
    maxCapacity: 5,
    regularPrice: 260,
    discount: 35,
    image: placeholderImage("alpine-vista"),
    description: "Spacious lodge with panoramic windows and warm interiors.",
  },
  {
    id: 3,
    name: "Lake Haven",
    maxCapacity: 7,
    regularPrice: 320,
    discount: 0,
    image: placeholderImage("lake-haven"),
    description: "Scenic lake-side cabin with a private deck and fireplace.",
  },
  {
    id: 4,
    name: "Summit Lodge",
    maxCapacity: 10,
    regularPrice: 420,
    discount: 60,
    image: placeholderImage("summit-lodge"),
    description: "Premium luxury cabin for larger groups and family stays.",
  },
];

const settings = {
  id: 1,
  minBookingLength: 1,
  maxBookingLength: 14,
  maxGuestsPerBooking: 10,
};

const guests = [demoGuest];

let bookingIdCounter = 2;
const bookings = [
  {
    id: 1,
    created_at: new Date(today.getTime() - oneDay * 2).toISOString(),
    startDate: new Date(today.getTime() + oneDay * 4).toISOString(),
    endDate: new Date(today.getTime() + oneDay * 7).toISOString(),
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
];

export function getMockCabins() {
  return cabins.map((cabin) => ({ ...cabin }));
}

export function getMockCabin(id) {
  return cabins.find((cabin) => cabin.id === Number(id)) ?? null;
}

export function getMockCabinPrice(id) {
  const cabin = getMockCabin(id);
  if (!cabin) return null;
  return { regularPrice: cabin.regularPrice, discount: cabin.discount };
}

export function getMockSettings() {
  return { ...settings };
}

export function getMockGuestByEmail(email) {
  return guests.find((guest) => guest.email === email) ?? null;
}

export function createMockGuest(newGuest) {
  const existing = getMockGuestByEmail(newGuest.email);
  if (existing) return existing;
  const guest = { id: guests.length + 1, ...newGuest };
  guests.push(guest);
  return guest;
}

export function updateMockGuestById(guestId, updatedFields) {
  const idx = guests.findIndex((guest) => guest.id === Number(guestId));
  if (idx < 0) return null;
  guests[idx] = { ...guests[idx], ...updatedFields };
  return { ...guests[idx] };
}

export function getMockBookingsByGuestId(guestId) {
  return bookings
    .filter((booking) => booking.guestId === Number(guestId))
    .map((booking) => ({
      ...booking,
      cabins: (() => {
        const cabin = getMockCabin(booking.cabinId);
        return cabin ? { name: cabin.name, image: cabin.image } : null;
      })(),
    }))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}

export function getMockBookingById(id) {
  return bookings.find((booking) => booking.id === Number(id)) ?? null;
}

export function createMockBooking(newBooking) {
  const booking = {
    id: bookingIdCounter++,
    created_at: new Date().toISOString(),
    ...newBooking,
  };
  bookings.push(booking);
  return { ...booking };
}

export function updateMockBooking(id, updatedFields) {
  const idx = bookings.findIndex((booking) => booking.id === Number(id));
  if (idx < 0) return null;
  bookings[idx] = { ...bookings[idx], ...updatedFields };
  return { ...bookings[idx] };
}

export function deleteMockBooking(id) {
  const idx = bookings.findIndex((booking) => booking.id === Number(id));
  if (idx < 0) return false;
  bookings.splice(idx, 1);
  return true;
}
