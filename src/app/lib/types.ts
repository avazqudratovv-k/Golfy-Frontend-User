import { BookingStatus, UserRole, UserStatus, VenueType } from "./enums";

export interface User {
  _id: string;
  role: UserRole;
  status: UserStatus;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Venue {
  _id: string;
  venueName: string;
  venueLocation: string;
  venueType?: VenueType;
  pricePerHour: number;
  venueDesc?: string;
  venueImages: string[];
  bookingCount: number;
  avgRating?: number;
  reviewCount?: number;
}

export interface Booking {
  _id: string;
  venueId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  price: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  reviewed?: boolean;
  venueData?: Venue[];
}

export interface Review {
  _id: string;
  bookingId: string;
  venueId: string;
  rating: number;
  comment: string;
  createdAt: string;
  userData?: { name: string; avatarUrl?: string }[];
  venueData?: { venueName: string }[];
}

export interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Availability {
  venueId: string;
  date: string;
  pricePerHour: number;
  slots: Slot[];
  booked: { startTime: string; endTime: string }[];
}

export interface VenueQuery {
  page: number;
  limit: number;
  sort?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  type?: string;
}
