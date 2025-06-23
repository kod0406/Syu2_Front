// src/Owner/MenuList.tsx

import React from 'react';
import { Menu } from './types'; // 공통 타입 정의에서 가져오기

type MenuListProps = {
  menus: Menu[];
  onEditClick: (menu: Menu) => void;
};

export default function MenuList({ menus, onEditClick }: MenuListProps) {
  return (
    <div className="grid gap-4">
      {menus.map((menu) => (
        <div key={menu.id} className="border rounded p-4 shadow-sm bg-white">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">{menu.name}</h2>
            <button
              onClick={() => onEditClick(menu)}
              className="text-sm text-blue-600 hover:underline"
            >
              수정
            </button>
          </div>
          <p className="text-sm text-gray-600">{menu.description}</p>
          <p className="text-sm text-gray-800 font-medium">{menu.price.toLocaleString()}원</p>
          {menu.imageUrl && (
            <img
              src={menu.imageUrl}
              alt={menu.name}
              className="mt-2 w-32 h-32 object-cover rounded"
            />
          )}
        </div>
      ))}
    </div>
  );
}
