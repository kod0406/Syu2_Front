// src/Owner/useMenus.ts

import { useCallback, useState } from 'react';
import { Menu } from './types'; // 또는 '../Owner/types' 경로

export function useMenus(storeId: number | null) {
  const [menus, setMenus] = useState<Menu[]>([]);

  const fetchMenus = useCallback(async () => {
    if (!storeId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/Store/Menu?StoreNumber=${storeId}`);
      const data: Menu[] = await res.json();
      setMenus(data);
    } catch (err) {
      console.error('❌ 메뉴 불러오기 실패:', err);
    }
  }, [storeId]);

  const addMenu = async (menu: Omit<Menu, 'id'>) => {
    try {
      await fetch('http://localhost:8080/api/Store/Menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menu),
      });
      await fetchMenus();
    } catch (err) {
      alert('❌ 메뉴 추가 실패');
    }
  };

  const editMenu = async (menu: Menu) => {
    try {
      await fetch(`http://localhost:8080/api/Store/Menu/${menu.menuId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menu),
      });
      await fetchMenus();
    } catch (err) {
      alert('❌ 메뉴 수정 실패');
    }
  };

  const deleteMenu = async (menuId: number) => {
    try {
      await fetch(`http://localhost:8080/api/Store/Menu/${menuId}`, {
        method: 'DELETE',
      });
      await fetchMenus();
    } catch (err) {
      alert('❌ 메뉴 삭제 실패');
    }
  };

  return {
    menus,
    fetchMenus,
    addMenu,
    editMenu,
    deleteMenu,
  };
}
