import React, { useState, useEffect, useMemo } from 'react';
import api from '../API/TokenConfig';

interface SalesItem {
  menuName: string;
  imageUrl?: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface Props {
  onClose: () => void;
}

const SalesModal: React.FC<Props> = ({ onClose }) => {
  const [statistics, setStatistics] = useState<SalesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const totalRevenueSum = useMemo(() => {
    return statistics.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
  }, [statistics]);

  useEffect(() => {
    api.get(`/statistics/store?period=${period}`)
      .then(res => {
        setStatistics(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('매출 통계 오류:', err);
        setLoading(false);
      });
  }, [period]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-[600px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">매출 통계</h2>

        <div className="flex gap-2 mb-4">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p as 'daily' | 'weekly' | 'monthly');
                setLoading(true);
              }}
              className={`px-3 py-1 rounded ${
                period === p ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
              }`}
            >
              {p === 'daily' ? '오늘' : p === 'weekly' ? '이번 주' : '이번 달'}
            </button>
          ))}
        </div>

        {loading ? (
          <p>불러오는 중...</p>
        ) : statistics.length === 0 ? (
          <p>데이터가 없습니다.</p>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="border px-2 py-1">이미지</th>
                <th className="border px-2 py-1">메뉴 이름</th>
                <th className="border px-2 py-1">판매 수량</th>
                <th className="border px-2 py-1">총 매출액</th>
              </tr>
            </thead>
            <tbody>
              {statistics.map((item, i) => (
                <tr key={i} className="text-center">
                  <td className="border px-2 py-1">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.menuName}
                        className="w-16 h-12 object-cover rounded mx-auto"
                      />
                    ) : (
                      <span className="text-gray-400">없음</span>
                    )}
                  </td>
                  <td className="border px-2 py-1">{item.menuName}</td>
                  <td className="border px-2 py-1">{item.totalQuantity}</td>
                  <td className="border px-2 py-1">
                    ₩{item.totalRevenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-4 text-right font-semibold text-lg">
          총 매출합: ₩{totalRevenueSum.toLocaleString()}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesModal;
