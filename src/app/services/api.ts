import api from "../lib/axiosInstance";
import { Availability, Booking, Review, User, Venue, VenueQuery } from "../lib/types";
import { BookingStatus } from "../lib/enums";

/** AUTH + PROFILE **/
export const authApi = {
  signup: async (input: { name: string; email: string; phone: string; password: string }): Promise<User> =>
    (await api.post("/user/signup", input)).data.user,
  login: async (input: { email: string; password: string }): Promise<User> =>
    (await api.post("/user/login", input)).data.user,
  logout: async (): Promise<void> => {
    await api.post("/user/logout", {});
  },
  profile: async (opts?: { silent?: boolean }): Promise<User> =>
    (await api.get("/user/profile", { skipAuthRedirect: opts?.silent })).data,
  updateProfile: async (form: FormData): Promise<User> =>
    (await api.post("/user/profile", form, { headers: { "Content-Type": "multipart/form-data" } })).data,
};

/** VENUES **/
export const venueApi = {
  list: async (query: VenueQuery): Promise<{ venues: Venue[]; total: number }> => {
    const res = await api.get("/venue/all", { params: query });
    const header = Number(res.headers["x-total-count"]);
    return { venues: res.data, total: Number.isFinite(header) ? header : res.data.length };
  },
  top: async (): Promise<Venue[]> => (await api.get("/venue/top")).data,
  one: async (id: string): Promise<Venue> => (await api.get(`/venue/${id}`)).data,
  similar: async (id: string): Promise<Venue[]> => (await api.get(`/venue/${id}/similar`)).data,
  availability: async (id: string, date: string): Promise<Availability> =>
    (await api.get(`/venue/${id}/availability`, { params: { date } })).data,
  stats: async (): Promise<{ totalBookings: number; totalVenues: number; totalUsers: number }> =>
    (await api.get("/stats")).data,
};

/** BOOKINGS **/
export const bookingApi = {
  create: async (input: { venueId: string; bookingDate: string; startTime: string; endTime: string }): Promise<Booking> =>
    (await api.post("/booking/create", input)).data,
  mine: async (): Promise<Booking[]> => (await api.get("/booking/my", { params: { limit: 100 } })).data,
  one: async (id: string): Promise<Booking> => (await api.get(`/booking/${id}`)).data,
  setStatus: async (bookingId: string, status: BookingStatus): Promise<Booking> =>
    (await api.post("/booking/update", { bookingId, status })).data,
};

/** REVIEWS, MESSAGES, FAVOURITES **/
export const reviewApi = {
  recent: async (params: { limit?: number; venueId?: string } = {}): Promise<Review[]> =>
    (await api.get("/review/recent", { params })).data,
  create: async (input: { bookingId: string; rating: number; comment: string }): Promise<Review> =>
    (await api.post("/review/create", input)).data,
};

export const messageApi = {
  create: async (input: { name: string; email: string; message: string }) =>
    (await api.post("/message/create", input)).data,
};

export const favoriteApi = {
  ids: async (): Promise<string[]> => (await api.get("/favorite/ids", { skipAuthRedirect: true })).data,
  mine: async (): Promise<Venue[]> => (await api.get("/favorite/my", { params: { limit: 100 } })).data,
  toggle: async (venueId: string): Promise<{ venueId: string; favorited: boolean }> =>
    (await api.post("/favorite/toggle", { venueId })).data,
};
