import { VenueStatus } from "../enums/venue.enum";

export interface Venue {
    _id: string;
    venueStatus: VenueStatus;
    venueName: string;
    venueLocation: string;
    pricePerHour: number;
    venueDesc?: string;
    venueImages: string[];
    bookingCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface VenueInquiry {
    page: number;
    limit: number;
    sort?: "cheap" | "expensive" | "popular";
    search?: string;
}