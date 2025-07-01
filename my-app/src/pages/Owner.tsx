import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardHeader from '../Owner/DashboardHeader';
import DashboardMenu from '../Owner/DashboardMenu';
import MenuList from '../Owner/MenuList';
import AddMenuModal from '../Owner/MenuAddModal';
import EditMenuModal from '../Owner/MenuEditModal';
import SalesModal from '../Owner/SalesModal';
import OrdersModal from '../Owner/OrdersModal';
import StoreProfileModal from '../Owner/StoreProfileModal';
import api from '../API/TokenConfig';
import QRModal from '../Owner/QrModal';

interface Menu {
  menuId: number;
  menuName: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
}

interface StoreInfo {
  id: number;
  storeName: string;
  ownerEmail: string;
}

export default function OwnerDashboard() {
  const { storeId: storeIdFromURL } = useParams();
  const [storeId, setStoreId] = useState<number | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showStoreProfileModal, setShowStoreProfileModal] = useState(false);
  const navigate = useNavigate();
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const fetchMenus = useCallback(async () => {
    if (!storeId) return;
    const res = await api.get(`/api/Store/Menu?StoreNumber=${storeId}`);
    const data = res.data;
    setMenus(data);
  }, [storeId]);

  const handleQrDownload = () => {
    if (storeId) {
      // api 인스턴스에서 baseURL 사용
      const downloadUrl = `${api.defaults.baseURL}/api/stores/${storeId}/qrcode/download`;
      window.location.href = downloadUrl;
    }
  };

  const handleQrView = async () => {
    if (storeId) {
      try {
        const res = await api.get(`/api/stores/${storeId}/qrcode/json`);
        const base64 = res.data.qrCodeBase64;
        setQrCodeBase64(base64);
        setShowQRModal(true);
      } catch (err) {
        alert('QR 코드 조회에 실패했습니다.');
      }
    }
  };

  const handleMenuAdded = async () => {
    await fetchMenus();
    setShowAddModal(false);
  };

  useEffect(() => {
    api
      .get('/auth/store')
      .then(res => {
        if (!res.data.data) {
          alert('로그인이 필요합니다.');
          navigate('/owner/login');
          return;
        }
        const storeData = res.data.data;
        setStoreId(storeData.id);
        setStoreInfo({
          id: storeData.id,
          storeName: storeData.storeName,
          ownerEmail: storeData.ownerEmail
        });
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

  const onStoreProfileClick = () => {
    setShowStoreProfileModal(true);
  };

  return (
    <div className="p-4">
      <DashboardHeader />
      <DashboardMenu
        onAddMenuClick={() => setShowAddModal(true)}
        onSalesClick={() => setShowSalesModal(true)}
        onOrdersClick={() => setShowOrdersModal(true)}
        onCouponClick={onCouponClick}
        onQrDownloadClick={handleQrDownload}
        onQrViewClick={handleQrView}
        onStoreProfileClick={onStoreProfileClick}
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
      {showQRModal && qrCodeBase64 && (
        <QRModal base64={qrCodeBase64} onClose={() => setShowQRModal(false)} />
      )}
      {showStoreProfileModal && (
        <StoreProfileModal
          onClose={() => setShowStoreProfileModal(false)}
        />
      )}
    </div>
  );
}
