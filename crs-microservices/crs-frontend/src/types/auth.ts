export type UserRole = 'ADMIN' | 'STUDENT';

export interface LoginResponse {
    token: string;
    username: string;
    role: UserRole;
}
