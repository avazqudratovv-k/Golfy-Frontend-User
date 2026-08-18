import axiosInstance from "../lib/axiosInstance";
import { BookingInput, BookingUpdateInput } from "../lib/types/booking";

class BookingService {
    public async createBooking(input: BookingInput): Promise<any> {
        try {
            const result = await axiosInstance.post("/booking/create", input);
            return result.data;
        } catch (err) {
            console.log("Error, createBooking:", err);
            throw err;
        }
    }

    public async updateBooking(input: BookingUpdateInput): Promise<any> {
        try {
            const result = await axiosInstance.post("/booking/update", input);
            return result.data;
        } catch (err) {
            console.log("Error, updateBooking:", err);
            throw err;
        }
    }

    

    public async getMyBookings(): Promise<any[]> {
        try {
            const result = await axiosInstance.get("/booking/my");
            return result.data;
        } catch (err) {
            console.log("Error, getMyBookings:", err);
            throw err;
        }
    }

    public async deleteBooking(id: string): Promise<any> {
    try {
        const result = await axiosInstance.delete(`/bookings/${id}`);
        return result.data;
    } catch (err) {
        console.log("Error, deleteBooking:", err);
        throw err;
    }
}
}

export default BookingService;