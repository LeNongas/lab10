export interface Course {
    id: number;
    tenMonHoc: string;
    soTinChi: number | null;
    soChoToiDa: number;
    soChoConLai: number;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // trang hiện tại (bắt đầu từ 0)
    size: number;
}