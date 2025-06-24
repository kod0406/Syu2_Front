import React from 'react';

interface Props {
  item: {
    menuId: number;
    menuName: string;
    price: number;
    description: string;
    imageUrl: string;
    rating: number;
  };
  onAdd: () => void;
  onViewReviews: (menuId: number, menuName: string) => void; // ✅ 추가
}

export default function MenuCard({ item, onAdd, onViewReviews }: Props) {
  return (
    <div className="relative flex gap-4 bg-white rounded shadow p-4">
      {/* ✅ 리뷰 보기 버튼 */}
      <button
        onClick={() => onViewReviews(item.menuId, item.menuName)}
        className="absolute top-2 right-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
      >
        리뷰 보기
      </button>

      <img
        src={item.imageUrl}
        alt={item.menuName}
        className="w-40 h-28 object-cover rounded"
      />
      <div className="flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{item.menuName}</h3>
            <span className="text-yellow-500 font-medium text-sm">
              ⭐ {item.rating.toFixed(1)} / 5
            </span>
          </div>
          <p className="text-red-600 font-semibold">
            ₩{item.price.toLocaleString()}
          </p>
          <p className="text-gray-500 text-sm">{item.description}</p>
        </div>
        <button
          onClick={onAdd}
          className="mt-2 px-3 py-1 bg-orange-500 text-white rounded"
        >
          담기
        </button>
      </div>
    </div>
  );
}
