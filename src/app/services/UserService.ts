import axiosInstance from "../lib/axiosInstance";
import { UserUpdateInput } from "../lib/types/user";

class UserService {
    public async getMyProfile(): Promise<any> {
        try {
            const result = await axiosInstance.get("/user/profile");
            return result.data;
        } catch (err) {
            console.log("Error, getMyProfile:", err);
            throw err;
        }
    }

    public async updateMyProfile(input: UserUpdateInput): Promise<any> {
        try {
            const result = await axiosInstance.post("/user/profile", input);
            return result.data;
        } catch (err) {
            console.log("Error, updateMyProfile:", err);
            throw err;
        }
    }
}

export default UserService;