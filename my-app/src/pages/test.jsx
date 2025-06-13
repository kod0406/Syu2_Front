import React from 'react';
import useOrderWebSocket from '../hooks/useOrderWebSocket'; // 경로에 맞게 수정

export default function TestPage() {
  const { orderData } = useOrderWebSocket(1); // storeId는 1번 고정

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">📦 실시간 주문 수신</h1>
      {orderData ? (
        <pre className="bg-gray-100 p-2 rounded shadow">{JSON.stringify(orderData, null, 2)}</pre>
      ) : (
        <p>📭 아직 데이터 없음</p>
      )}
    </div>
  );
}
