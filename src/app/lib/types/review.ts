export interface Review {
    _id: string;
    bookingId: string;
    userId: string;
    venueId: string;
    rating: number;
    comment: string;
    createdAt: string;
    userData?: { name: string }[];
    venueData?: { venueName: string }[];
}

export interface ReviewInput {
    bookingId: string;
    venueId: string;
    rating: number;
    comment: string;
}