import axiosInstance from "../lib/axiosInstance";

class VenueService {
    public async getAllVenues(inquiry?: any): Promise<any[]> {
        try {
            const result = await axiosInstance.get("/venue/all", { params: inquiry });
            return result.data;
        } catch (err) {
            console.log("Error, getAllVenues:", err);
            throw err;
        }
    }

    public async getTopVenues(): Promise<any[]> {
        try {
            const result = await axiosInstance.get("/venue/top");
            return result.data;
        } catch (err) {
            console.log("Error, getTopVenues:", err);
            throw err;
        }
    }

    public async getVenue(id: string): Promise<any> {
        try {
            const result = await axiosInstance.get(`/venue/${id}`);
            return result.data;
        } catch (err) {
            console.log("Error, getVenue:", err);
            throw err;
        }
    }
    public async getStats(): Promise<any> {
    try {
        const result = await axiosInstance.get("/stats");
        return result.data;
    } catch (err) {
        console.log("Error, getStats:", err);
        throw err;
    }
}
}

export default VenueService;