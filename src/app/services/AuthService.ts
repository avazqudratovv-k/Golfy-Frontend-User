import axiosInstance from "../lib/axiosInstance";
import { LoginInput, User, UserInput } from "../lib/types/user";

class AuthService {
    public async signup(input: UserInput): Promise<User> {
        try {
            const result = await axiosInstance.post("/user/signup", input);
            const user: User = result.data.user;
            localStorage.setItem("userData", JSON.stringify(user));
            return user;
        } catch (err) {
            console.log("Error, signup:", err);
            throw err;
        }
    }

    public async login(input: LoginInput): Promise<User> {
        try {
            const result = await axiosInstance.post("/user/login", input);
            const user: User = result.data.user;
            localStorage.setItem("userData", JSON.stringify(user));
            return user;
        } catch (err) {
            console.log("Error, login:", err);
            throw err;
        }
    }

    public async logout(): Promise<void> {
        try {
            const result = await axiosInstance.post("/user/logout", {});
            localStorage.removeItem("userData");
            return result.data.logout;
        } catch (err) {
            console.log("Error, logout:", err);
            throw err;
        }
    }
}

export default AuthService;