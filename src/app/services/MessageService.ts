import axiosInstance from "../lib/axiosInstance";
import { MessageInput } from "../lib/types/message";

class MessageService {
    public async createMessage(input: MessageInput): Promise<any> {
        try {
            const result = await axiosInstance.post("/message/create", input);
            return result.data;
        } catch (err) {
            console.log("Error, createMessage:", err);
            throw err;
        }
    }
}

export default MessageService;