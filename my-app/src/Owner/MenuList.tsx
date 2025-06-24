import React from 'react';
import MenuCard from './MenuCard';
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
  menus: Menu[];
  storeId: number;
  setMenus: (menus: Menu[]) => void;
  onEdit: (menu: Menu) => void;
}

const MenuList: React.FC<Props> = ({ menus, storeId, setMenus, onEdit }) => {
  const fetchMenus = async () => {
    const res = await api.get(
      `/api/Store/Menu?StoreNumber=${storeId}`
    );
    setMenus(res.data);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">등록된 메뉴 목록</h2>
      <ul className="grid grid-cols-2 gap-4">
        {menus.map(menu => (
          <MenuCard
            key={menu.menuId}
            menu={menu}
            storeId={storeId}
            onEdit={onEdit}
            onDeleted={fetchMenus}
            onToggled={fetchMenus}
          />
        ))}
      </ul>
    </div>
  );
};

export default MenuList;
