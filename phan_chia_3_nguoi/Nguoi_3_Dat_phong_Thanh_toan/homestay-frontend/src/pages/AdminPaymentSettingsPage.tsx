import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { getPaymentSettings, updatePaymentSettings } from '../api/paymentSettingsApi';
import type { PaymentSettings } from '../api/paymentSettingsApi';

const initial: PaymentSettings = { depositPercent: 30, bankName: '', accountNumber: '', accountHolder: '', configured: false };

function errorText(error: unknown) {
    if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
        return error.response.data.message as string;
    }
    return 'Không thể lưu thông tin chuyển khoản. Vui lòng thử lại.';
}

export default function AdminPaymentSettingsPage() {
    const [values, setValues] = useState<PaymentSettings>(initial);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        void getPaymentSettings().then(({ data }) => setValues(data))
            .catch((requestError) => setError(errorText(requestError)))
            .finally(() => setLoading(false));
    }, []);

    const save = async (event: FormEvent) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        if (!/^[0-9]{6,30}$/.test(values.accountNumber.trim())) {
            setError('Số tài khoản cần có 6–30 chữ số.');
            return;
        }
        setSaving(true);
        try {
            const { data } = await updatePaymentSettings({
                depositPercent: values.depositPercent,
                bankName: values.bankName.trim(),
                accountNumber: values.accountNumber.trim(),
                accountHolder: values.accountHolder.trim(),
            });
            setValues(data);
            setSuccess('Đã lưu thông tin nhận cọc. Khách có thể chọn chuyển khoản đặt cọc.');
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setSaving(false);
        }
    };

    return <section>
        <span className="eyebrow">DÀNH CHO QUẢN TRỊ VIÊN</span>
        <h1>Thông tin nhận cọc</h1>
        <p className="page-lead">Nhập tài khoản ngân hàng thật của homestay. Tiền cọc của mỗi đơn được tính theo tỷ lệ tại lúc khách tạo đơn.</p>
        {loading && <p>Đang tải...</p>}
        {!loading && <form className="card stack payment-settings-form" onSubmit={(event) => void save(event)}>
            {!values.configured && <p className="message error">Chưa có thông tin chuyển khoản. Khách hiện chỉ chọn được thanh toán khi nhận phòng.</p>}
            <label className="field">Tỷ lệ đặt cọc (%)
                <input type="number" min={1} max={100} required value={values.depositPercent}
                    onChange={(event) => setValues({ ...values, depositPercent: Number(event.target.value) })} />
            </label>
            <label className="field">Tên ngân hàng
                <input value={values.bankName} maxLength={100} required placeholder="Ví dụ: tên ngân hàng nhận tiền"
                    onChange={(event) => setValues({ ...values, bankName: event.target.value })} />
            </label>
            <label className="field">Số tài khoản
                <input value={values.accountNumber} inputMode="numeric" maxLength={30} required
                    onChange={(event) => setValues({ ...values, accountNumber: event.target.value })} />
            </label>
            <label className="field">Tên chủ tài khoản
                <input value={values.accountHolder} maxLength={100} required
                    onChange={(event) => setValues({ ...values, accountHolder: event.target.value })} />
            </label>
            {error && <p className="message error" role="alert">{error}</p>}
            {success && <p className="message success" role="status">{success}</p>}
            <button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thông tin nhận cọc'}</button>
        </form>}
    </section>;
}
