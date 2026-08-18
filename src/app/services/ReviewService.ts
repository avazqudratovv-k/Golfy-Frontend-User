import axiosInstance from "../lib/axiosInstance";
import { ReviewInput } from "../lib/types/review";


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

public async createReview(input: ReviewInput): Promise<any> {
    try {
        const result = await axiosInstance.post("/review/create", input);
        return result.data;
    } catch (err) {
        console.log("Error, createReview:", err);
        throw err;
    }
}
}

export default ReviewService;