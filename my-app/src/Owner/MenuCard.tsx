import React from 'react';
import ToggleButton from './ToggleButton';
import api from '../API/TokenConfig';

interface Menu {
  menuId: number;
  menuName: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
}

interface Props {
  menu: Menu;
  storeId: number;
  onEdit: (menu: Menu) => void;
  onDeleted: () => void;
  onToggled: () => void;
}

const MenuCard: React.FC<Props> = ({ menu, storeId, onEdit, onDeleted, onToggled }) => {
  const handleDelete = async () => {
    console.log('현재 storeId:', storeId);
    console.log('삭제하려는 메뉴:', menu);
    if (!window.confirm('정말로 이 메뉴를 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/api/store/${storeId}/menus/${menu.menuId}`);
      onDeleted();
    } catch (err) {
      console.error('❌ 삭제 실패:', err);
      alert('삭제 중 오류 발생');
    }
  };

  return (
    <li className="flex justify-between gap-6 bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-3xl p-6 hover:shadow-2xl transition-all duration-200">
      {/* 왼쪽: 이미지 + 정보 */}
      <div className="flex gap-5">
        <img
          src={menu.imageUrl || ''}
          alt={menu.menuName}
          className="w-28 h-24 object-cover rounded-xl shadow-md"
        />
        <div className="flex flex-col justify-between">
          <h3 className="text-xl font-bold text-gray-800">{menu.menuName}</h3>
          <p className="text-red-500 text-lg font-semibold">
            ₩{menu.price?.toLocaleString()}
          </p>
          <p className="text-gray-500 text-sm">{menu.description}</p>
        </div>
      </div>

      {/* 오른쪽: 버튼들 */}
      <div className="flex flex-col items-end justify-between gap-2">
        <button
          onClick={() => onEdit(menu)}
          className="px-4 py-1 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-medium shadow-md transition"
        >
          ✏️ 수정
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium shadow-md transition"
        >
          🗑️ 삭제
        </button>
        <ToggleButton
          storeId={storeId}
          menuId={menu.menuId}
          isAvailable={menu.available}
          onToggled={async () => {
            await onToggled();
          }}
        />
      </div>
    </li>
  );
};

export default MenuCard;
