export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface LoginResponse {
    userId: number;
    token: string;
    username: string;
    role: UserRole;
}
