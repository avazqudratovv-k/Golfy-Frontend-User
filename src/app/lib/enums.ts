export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  FINISHED = "FINISHED",
  CANCELLED = "CANCELLED",
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCK = "BLOCK",
  DELETE = "DELETE",
}

export type VenueType = "COURSE" | "SIMULATOR" | "RANGE";
