import { BookingStatus } from "../enums/booking.enum";
import { Venue } from "./venue";

export interface Booking {
    _id: string;
    userId: string;
    venueId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    price: number;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
    venueData?: Venue[];
}

export interface BookingInput {
    venueId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    price: number;
}

export interface BookingUpdateInput {
    bookingId: string;
    status: BookingStatus;
}