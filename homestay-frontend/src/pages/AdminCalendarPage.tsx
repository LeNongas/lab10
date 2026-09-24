import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { createBlock, deleteBlock, getCalendar } from '../api/calendarApi';
import type { BlockValues, CalendarResponse } from '../api/calendarApi';

const now = new Date();
const initialMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

function moveMonth(month: string, offset: number) {
    const [year, part] = month.split('-').map(Number);
    const date = new Date(year, part - 1 + offset, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function errorText(error: unknown) {
    if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
        return error.response.data.message as string;
    }
    return 'Không thể xử lý lịch phòng. Vui lòng thử lại.';
}

export default function AdminCalendarPage() {
    const [month, setMonth] = useState(initialMonth);
    const [calendar, setCalendar] = useState<CalendarResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [values, setValues] = useState<BlockValues>({ roomId: 0, startDate: '', endDate: '', units: 1, reason: '' });

    const loadCalendar = useCallback(async () => {
        setLoading(true);
        try {
            setCalendar((await getCalendar(month)).data);
            setError('');
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setLoading(false);
        }
    }, [month]);

    useEffect(() => { void loadCalendar(); }, [loadCalendar]);

    const save = async (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);
        try {
            await createBlock({ ...values, reason: values.reason.trim() });
            setValues({ ...values, reason: '' });
            await loadCalendar();
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id: number) => {
        if (!window.confirm('Xóa lịch khóa phòng này?')) return;
        setSaving(true);
        try {
            await deleteBlock(id);
            await loadCalendar();
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setSaving(false);
        }
    };

    const [year, part] = month.split('-').map(Number);
    const dayNumbers = Array.from({ length: new Date(year, part, 0).getDate() }, (_, index) => index + 1);

    return <section>
        <span className="eyebrow">DÀNH CHO QUẢN TRỊ VIÊN</span>
        <h1>Lịch phòng</h1>
        <p className="page-lead">Xem số phòng trống từng ngày và khóa phòng để bảo trì. Nhấn vào một ô ngày để điền nhanh lịch khóa.</p>

        <div className="calendar-toolbar">
            <button type="button" onClick={() => setMonth(moveMonth(month, -1))} aria-label="Tháng trước">‹</button>
            <label>Tháng <input type="month" value={month} onChange={(event) => setMonth(event.target.value || initialMonth)} /></label>
            <button type="button" onClick={() => setMonth(moveMonth(month, 1))} aria-label="Tháng sau">›</button>
            <button type="button" onClick={() => void loadCalendar()} disabled={loading}>Tải lại</button>
        </div>

        <div className="calendar-legend">
            <span><i className="legend-free" /> Còn phòng</span>
            <span><i className="legend-full" /> Đã kín</span>
            <span><i className="legend-blocked" /> Có phòng bảo trì</span>
        </div>
        {error && <p className="message error" role="alert">{error}</p>}
        {loading && <p>Đang tải lịch...</p>}
        {!loading && calendar && <div className="calendar-scroll">
            <table className="calendar-table">
                <thead><tr><th scope="col">Phòng</th>{dayNumbers.map((day) => <th scope="col" key={day}>{day}</th>)}</tr></thead>
                <tbody>{calendar.rooms.map((room) => <tr key={room.roomId}>
                    <th scope="row"><strong>{room.roomName}</strong><small>{room.quantity} phòng</small></th>
                    {room.days.map((day) => <td key={day.date}>
                        <button type="button"
                            className={`calendar-cell ${day.blocked > 0 ? 'is-blocked' : day.available === 0 ? 'is-full' : 'is-free'}`}
                            title={`${day.date}: ${day.available} trống, ${day.booked} đã đặt, ${day.blocked} bảo trì`}
                            onClick={() => setValues({ ...values, roomId: room.roomId, startDate: day.date, endDate: day.date })}>
                            {day.available}<small>{day.blocked > 0 ? `−${day.blocked}` : ''}</small>
                        </button>
                    </td>)}
                </tr>)}</tbody>
            </table>
            {calendar.rooms.length === 0 && <p>Chưa có phòng để hiển thị.</p>}
        </div>}

        <form className="card stack calendar-block-form" onSubmit={(event) => void save(event)}>
            <h2>Khóa phòng bảo trì</h2>
            <div className="calendar-form-grid">
                <label className="field">Phòng
                    <select value={values.roomId} required onChange={(event) => setValues({ ...values, roomId: Number(event.target.value) })}>
                        <option value={0}>Chọn phòng</option>
                        {calendar?.rooms.map((room) => <option key={room.roomId} value={room.roomId}>{room.roomName}</option>)}
                    </select>
                </label>
                <label className="field">Từ ngày
                    <input type="date" min={today} value={values.startDate} required onChange={(event) => {
                        const startDate = event.target.value;
                        setValues({ ...values, startDate, endDate: values.endDate < startDate ? startDate : values.endDate });
                    }} />
                </label>
                <label className="field">Đến hết ngày
                    <input type="date" min={values.startDate || today} value={values.endDate} required
                        onChange={(event) => setValues({ ...values, endDate: event.target.value })} />
                </label>
                <label className="field">Số phòng khóa
                    <input type="number" min={1} max={calendar?.rooms.find((room) => room.roomId === values.roomId)?.quantity}
                        value={values.units} required onChange={(event) => setValues({ ...values, units: Number(event.target.value) })} />
                </label>
                <label className="field">Lý do
                    <input value={values.reason} maxLength={255} required placeholder="Ví dụ: sửa điều hòa"
                        onChange={(event) => setValues({ ...values, reason: event.target.value })} />
                </label>
            </div>
            <button type="submit" disabled={saving || !calendar?.rooms.length}>{saving ? 'Đang lưu...' : 'Khóa phòng'}</button>
        </form>

        <div className="calendar-block-list">
            <h2>Lịch bảo trì trong tháng</h2>
            {calendar?.blocks.length === 0 && <p>Chưa có lịch bảo trì.</p>}
            {calendar?.blocks.map((block) => <article className="card admin-user-row" key={block.id}>
                <div><strong>{block.roomName}</strong><p>{block.startDate} – {block.endDate} · {block.units} phòng · {block.reason}</p></div>
                <button type="button" className="danger" disabled={saving} onClick={() => void remove(block.id)}>Bỏ khóa</button>
            </article>)}
        </div>
    </section>;
}
