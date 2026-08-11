import { UserRole, UserStatus } from "../enums/user.enum";

export interface User {
    _id: string;
    role: UserRole;
    status: UserStatus;
    name: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserInput {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface UserUpdateInput {
    _id: string;
    name?: string;
    phone?: string;
    avatarUrl?: string;
}