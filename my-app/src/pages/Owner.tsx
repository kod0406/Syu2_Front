import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardHeader from '../Owner/DashboardHeader';
import DashboardMenu from '../Owner/DashboardMenu';
import MenuList from '../Owner/MenuList';
import AddMenuModal from '../Owner/MenuAddModal';
import EditMenuModal from '../Owner/MenuEditModal';
import SalesModal from '../Owner/SalesModal';
import OrdersModal from '../Owner/OrdersModal';
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

export default function OwnerDashboard() {
  const { storeId: storeIdFromURL } = useParams();
  const [storeId, setStoreId] = useState<number | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
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
        setStoreId(res.data.data.id);
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
        onQrDownloadClick={handleQrDownload}
        onQrViewClick={handleQrView}
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

    </div>
  );
}
