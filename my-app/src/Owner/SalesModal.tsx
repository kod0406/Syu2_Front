// src/Owner/SalesModal.tsx

import React, { useEffect, useState } from 'react';
import { DailySales } from './types'; // 공통 타입만 사용

type SalesModalProps = {
  storeId: number;
  onClose: () => void;
};

export default function SalesModal({ storeId, onClose }: SalesModalProps) {
  const [sales, setSales] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/sales?storeId=${storeId}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('매출 조회 실패');
        const data: DailySales[] = await res.json();
        setSales(data);
      } catch (err) {
        alert('매출 정보를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [storeId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">📈 매출 현황</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>

        {loading ? (
          <p>로딩 중...</p>
        ) : sales.length === 0 ? (
          <p>📭 매출 데이터가 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">날짜</th>
                <th className="pb-2 text-right">총 매출</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.date}</td>
                  <td className="py-2 text-right">{item.totalSales.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
