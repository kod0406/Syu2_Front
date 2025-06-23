import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardHeader from '../Owner/DashboardHeader';
import DashboardMenu from '../Owner/DashboardMenu';
import MenuList from '../Owner/MenuList';
import AddMenuModal from '../Owner/MenuAddModal';
import EditMenuModal from '../Owner/MenuEditModal';
import SalesModal from '../Owner/SalesModal';
import OrdersModal from '../Owner/OrdersModal';

interface Menu {
  menuId: number;
  menuName: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
}

export default function OwnerDashboard() {
  const { storeId: storeIdFromURL } = useParams();
  const [storeId, setStoreId] = useState<number | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const navigate = useNavigate();

  const fetchMenus = useCallback(async () => {
    if (!storeId) return;
    const res = await fetch(`http://localhost:8080/api/Store/Menu?StoreNumber=${storeId}`);
    const data = await res.json();
    setMenus(data);
  }, [storeId]);

  const handleMenuAdded = async () => {
    await fetchMenus();
    setShowAddModal(false);
  };

  useEffect(() => {
    fetch('http://localhost:8080/auth/store', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (!data.data) {
          alert('로그인이 필요합니다.');
          navigate('/owner/login');
          return;
        }
        setStoreId(data.data.id);
      })
      .catch(() => {
        alert('로그인이 필요합니다.');
        navigate('/owner/login');
      });
  }, [storeIdFromURL, navigate]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const onCouponClick = () => {
    navigate(`/owner/${storeId}/coupon`);
  };

  return (
    <div className="p-4">
      <DashboardHeader />
      <DashboardMenu
        onAddMenuClick={() => setShowAddModal(true)}
        onSalesClick={() => setShowSalesModal(true)}
        onOrdersClick={() => setShowOrdersModal(true)}
        onCouponClick={onCouponClick}
      />
      {storeId && (
        <MenuList
          menus={menus}
          storeId={storeId}
          setMenus={setMenus}
          onEdit={setEditingMenu}
        />
      )}
      {showAddModal && storeId && (
        <AddMenuModal
          storeId={storeId}
          onClose={() => setShowAddModal(false)}
          onAdded={handleMenuAdded}
        />
      )}
      {editingMenu && storeId && (
        <EditMenuModal
          storeId={storeId}
          menu={editingMenu}
          onClose={() => setEditingMenu(null)}
          onUpdated={(updatedMenus) => {
            setMenus(updatedMenus);
            setEditingMenu(null);
          }}
        />
      )}
      {showSalesModal && <SalesModal onClose={() => setShowSalesModal(false)} />}
      {showOrdersModal && storeId && (
        <OrdersModal storeId={storeId} onClose={() => setShowOrdersModal(false)} />
      )}
    </div>
  );
}
