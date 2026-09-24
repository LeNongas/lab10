import axiosClient from './axiosClient';

export interface PaymentSettings {
    depositPercent: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    configured: boolean;
}

export const getPaymentSettings = () => axiosClient.get<PaymentSettings>('/api/admin/payment-settings');
export const updatePaymentSettings = (settings: Omit<PaymentSettings, 'configured'>) =>
    axiosClient.put<PaymentSettings>('/api/admin/payment-settings', settings);
