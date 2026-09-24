export interface Booking {
    id: number;
    customerId: number;
    customerName: string;
    roomId: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED';
    statusReason: string | null;
    createdAt: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    guestFullName: string | null;
    guestPhone: string | null;
    checkInNote: string | null;
    pricePerNight: number | null;
    totalPrice: number | null;
    depositAmount: number | null;
    depositPercent: number | null;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountHolder: string | null;
    transferReference: string | null;
    paymentMethod: 'BANK_TRANSFER_DEPOSIT' | 'PAY_AT_CHECKIN' | null;
    paymentStatus: 'UNPAID' | 'DEPOSIT_PAID' | 'PAID' | 'REFUND_PENDING' | 'REFUNDED';
}

export type PaymentMethod = NonNullable<Booking['paymentMethod']>;
export type PaymentStatus = Booking['paymentStatus'];

export interface BookingRequest {
    roomId: number;
    checkIn: string;
    checkOut: string;
    guests: number;
    guestFullName: string;
    guestPhone: string;
    checkInNote: string;
}
