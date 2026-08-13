import axiosInstance from "../lib/axiosInstance";

class ReviewService {
    public async getRecentReviews(limit: number = 3): Promise<any[]> {
        try {
            const result = await axiosInstance.get("/review/recent", { params: { limit } });
            return result.data;
        } catch (err) {
            console.log("Error, getRecentReviews:", err);
            throw err;
        }
    }
}

export default ReviewService;