export interface Room {
    id: number;
    name: string;
    maxGuests: number;
    quantity: number;
    availableToday: number;
    availableForStay?: number | null;
    pricePerNight: number;
    description?: string | null;
    imageUrl?: string | null;
    categoryId: number;
    categoryName: string;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // trang hiện tại (bắt đầu từ 0)
    size: number;
}
