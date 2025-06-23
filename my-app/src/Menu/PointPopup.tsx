import React from 'react';

interface Props {
  availablePoints: number;
  usedPoints: number;
  setUsedPoints: (value: number) => void;
  onClose: () => void;
}

export default function PointPopup({
  availablePoints,
  usedPoints,
  setUsedPoints,
  onClose,
}: Props) {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-lg font-bold mb-2">포인트 사용</h2>
        <p className="mb-2">
          보유 포인트: <strong>{availablePoints.toLocaleString()}</strong>원
        </p>
        <input
          type="number"
          min="0"
          max={availablePoints}
          value={usedPoints === 0 ? '' : usedPoints}
          onChange={(e) =>
            setUsedPoints(Math.min(availablePoints, Number(e.target.value)))
          }
          className="w-full mb-4 p-2 border rounded"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            취소
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            사용하기
          </button>
        </div>
      </div>
    </div>
  );
}
