import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import {
    createApiKey,
    getApiKeys,
    revokeApiKey,
} from '../api/apiKeyApi';
import type { ApiErrorResponse } from '../types/apiError';
import type { ApiKey } from '../types/apiKey';

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [ownerName, setOwnerName] = useState('');
    const [scopes, setScopes] = useState('courses:read');
    const [validDays, setValidDays] = useState('30');
    const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadKeys = useCallback(() => {
        setLoading(true);
        getApiKeys()
            .then((response) => setKeys(response.data))
            .catch(() => setError('Không tải được danh sách API Key.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadKeys();
    }, [loadKeys]);

    const handleCreate = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setNewKeyValue(null);

        try {
            const response = await createApiKey({
                ownerName,
                scopes,
                validDays: validDays ? Number(validDays) : undefined,
            });
            setNewKeyValue(response.data.keyValue);
            setOwnerName('');
            loadKeys();
        } catch (requestError) {
            if (
                axios.isAxiosError<ApiErrorResponse>(requestError) &&
                requestError.response?.data?.message
            ) {
                setError(requestError.response.data.message);
            } else {
                setError('Cấp API Key không thành công.');
            }
        }
    };

    const handleRevoke = async (key: ApiKey) => {
        if (!window.confirm(`Thu hồi API Key của "${key.ownerName}"?`)) {
            return;
        }

        try {
            await revokeApiKey(key.id);
            loadKeys();
        } catch {
            window.alert('Thu hồi không thành công.');
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <h1>Quản lý API Key đối tác</h1>

            <form
                onSubmit={handleCreate}
                style={{
                    border: '1px solid #ddd',
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 24,
                }}
            >
                <h3>Cấp API Key mới</h3>

                <div style={{ marginBottom: 8 }}>
                    <label htmlFor="api-key-owner">Tên đối tác</label>
                    <br />
                    <input
                        id="api-key-owner"
                        value={ownerName}
                        onChange={(event) => setOwnerName(event.target.value)}
                        required
                    />
                </div>

                <div style={{ marginBottom: 8 }}>
                    <label htmlFor="api-key-scopes">Scopes (cách nhau bởi dấu phẩy)</label>
                    <br />
                    <input
                        id="api-key-scopes"
                        value={scopes}
                        onChange={(event) => setScopes(event.target.value)}
                        required
                    />
                </div>

                <div style={{ marginBottom: 8 }}>
                    <label htmlFor="api-key-valid-days">
                        Hiệu lực (số ngày, để trống = vĩnh viễn)
                    </label>
                    <br />
                    <input
                        id="api-key-valid-days"
                        type="number"
                        value={validDays}
                        onChange={(event) => setValidDays(event.target.value)}
                    />
                </div>

                {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
                <button type="submit">Cấp API Key</button>
            </form>

            {newKeyValue && (
                <div
                    style={{
                        background: '#fef9c3',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 24,
                    }}
                >
                    <strong>Key vừa tạo (chỉ hiển thị 1 lần, hãy lưu lại ngay):</strong>
                    <pre style={{ userSelect: 'all' }}>{newKeyValue}</pre>
                </div>
            )}

            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
                            <th>Đối tác</th>
                            <th>Scopes</th>
                            <th>Trạng thái</th>
                            <th>Hết hạn</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {keys.map((key) => (
                            <tr key={key.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td>{key.ownerName}</td>
                                <td>{key.scopes}</td>
                                <td
                                    style={{
                                        color: key.status === 'ACTIVE' ? '#15803d' : '#b91c1c',
                                    }}
                                >
                                    {key.status}
                                </td>
                                <td>
                                    {key.expiresAt
                                        ? new Date(key.expiresAt).toLocaleDateString('vi-VN')
                                        : 'Vĩnh viễn'}
                                </td>
                                <td>
                                    {key.status === 'ACTIVE' && (
                                        <button type="button" onClick={() => handleRevoke(key)}>
                                            Thu hồi
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
