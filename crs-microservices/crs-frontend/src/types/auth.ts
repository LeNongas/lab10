export type UserRole = 'ADMIN' | 'STUDENT';

export interface LoginResponse {
    userId: number;
    token: string;
    username: string;
    role: UserRole;
}