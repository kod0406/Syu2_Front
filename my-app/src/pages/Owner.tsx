// src/pages/OwnerDashboard.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import DashboardHeader from '../Owner/DashboardHeader';
import DashboardMenu from '../Owner/DashboardMenu';
import MenuList from '../Owner/MenuList';
import MenuAddModal from '../Owner/MenuAddModal';
import MenuEditModal from '../Owner/MenuEditModal';
import OrdersModal from '../Owner/OrdersModal';
import SalesModal from '../Owner/SalesModal';

import { useMenus } from '../Owner/useMenus';
import { Menu } from '../Owner/types';

export default function OwnerDashboard() {
  const { storeId: storeIdFromURL } = useParams();
  const [storeId, setStoreId] = useState<number | null>(null);
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);

  const { menus, fetchMenus } = useMenus(storeId);

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
    if (storeId) navigate(`/owner/${storeId}/coupon`);
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
      <MenuList menus={menus} onEditClick={setEditingMenu} />

      {showAddModal && (
        <MenuAddModal
          onClose={() => setShowAddModal(false)}
          onAddComplete={fetchMenus}
        />
      )}

      {editingMenu && (
        <MenuEditModal
          menu={editingMenu}
          onClose={() => setEditingMenu(null)}
          onEditComplete={() => {
            fetchMenus();
            setEditingMenu(null);
          }}
        />
      )}

      {showOrdersModal && storeId && (
        <OrdersModal storeId={storeId} onClose={() => setShowOrdersModal(false)} />
      )}

      {showSalesModal && storeId && (
        <SalesModal storeId={storeId} onClose={() => setShowSalesModal(false)} />
      )}
    </div>
  );
}
