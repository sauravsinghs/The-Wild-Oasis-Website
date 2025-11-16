"use server";

import { auth, signIn, signOut } from "./auth";
import {
  createBookingRecord,
  deleteBookingRecord,
  getBookings,
  updateBookingRecord,
  updateGuestById,
} from "./data-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalID = formData.get("nationalID");
  const nationalityRaw = formData.get("nationality") || "";
  const [nationality, countryFlag] = nationalityRaw.includes("%")
    ? nationalityRaw.split("%")
    : [nationalityRaw, session.user.countryFlag || ""];

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid national ID");

  const updateData = { nationality, countryFlag, nationalID };
  await updateGuestById(session.user.guestId, updateData);

  revalidatePath("/account/profile");
}

export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");
  if (!session.user.guestId)
    throw new Error("Please complete your profile before making a reservation");
  if (!bookingData?.startDate || !bookingData?.endDate || !bookingData?.numNights)
    throw new Error("Please select a valid date range");

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  await createBookingRecord(newBooking);

  revalidatePath(`/cabins/${bookingData.cabinId}`);
  revalidatePath("/account/reservations");
  revalidatePath("/account");

  redirect("/cabins/thankyou");
}

export async function deleteBooking(bookingId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to delete this booking");

  await deleteBookingRecord(bookingId);

  revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
  const bookingId = Number(formData.get("bookingId"));

  // 1) Authentication
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // 2) Authorization
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to update this booking");

  // 3) Building update data
  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  // 4) Mutation
  await updateBookingRecord(bookingId, updateData);

  // 6) Revalidation
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath("/account/reservations");

  // 7) Redirecting
  redirect("/account/reservations");
}

export async function signInAction() {
  const isMockMode = process.env.MOCK_MODE === "true";
  await signIn("google", { redirectTo: "/account" });
  if (isMockMode) redirect("/account");
}

export async function signOutAction() {
  const isMockMode = process.env.MOCK_MODE === "true";
  await signOut({ redirectTo: "/" });
  if (isMockMode) redirect("/");
}
