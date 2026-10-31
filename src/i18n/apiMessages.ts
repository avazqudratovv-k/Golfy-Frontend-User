import i18n from "./index";

// The backend answers in English. Known messages are mapped to translation keys (apiError.*);
// anything else is shown as the raw text, so a new backend message never disappears.
const EXACT: Record<string, string> = {
  "Something went wrong": "generic",
  "No data is found": "noData",
  "Create is failed": "createFailed",
  "Update is failed": "updateFailed",
  "You do not have admin access!": "notAdmin",
  "You are inserting already used email or phone!": "usedEmailPhone",
  "This email is already in use!": "emailUsed",
  "This phone number is already in use!": "phoneUsed",
  "Use at least 8 characters for the password!": "passwordTooShort",
  "No user with that email!": "noUserEmail",
  "Wrong password, please try again!": "wrongPassword",
  "You are not authenticated, please login first!": "notAuthenticated",
  "This time slot is already booked!": "slotBooked",
  "Please select a date and time before paying!": "dateTimeRequired",
  "Booking not found!": "bookingNotFound",
  "You can only review venues you have booked and played!": "notEligibleReview",
  "You have already reviewed this booking!": "alreadyReviewed",
  "A venue with this name already exists!": "venueExists",
  "Please check the information you entered!": "invalidInput",
  "Invalid id!": "invalidId",
  "This status change is not allowed!": "invalidStatusChange",
  "Only image files up to 5MB are allowed!": "invalidFile",
  "Too many requests, please try again later!": "tooManyRequests",
};

/** the booking-conflict message carries the existing slot's times */
const CONFLICT = /^This slot conflicts with an existing booking from (\d{1,2}:\d{2}) to (\d{1,2}:\d{2})\./;
const BLOCKED = /^You have been blocked/i;

export function translateApiMessage(message: string): string {
  if (!message) return message;
  const exact = EXACT[message.trim()];
  if (exact) return i18n.t(`apiError.${exact}`);
  const conflict = CONFLICT.exec(message);
  if (conflict) return i18n.t("apiError.slotConflict", { from: conflict[1], to: conflict[2] });
  if (BLOCKED.test(message)) return i18n.t("apiError.blocked");
  return message;
}
