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
    <li className="flex bg-white rounded shadow p-4 justify-between gap-4">
      <div className="flex gap-4">
        <img
          src={menu.imageUrl || ''}
          alt={menu.menuName}
          className="w-28 h-24 object-cover rounded"
        />
        <div>
          <h3 className="text-lg font-bold">{menu.menuName}</h3>
          <p className="text-red-600 font-semibold">₩{menu.price?.toLocaleString()}</p>
          <p className="text-gray-500 text-sm">{menu.description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onEdit(menu)}
          className="px-3 py-1 bg-yellow-400 text-white rounded text-sm"
        >
          수정
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          삭제
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
