import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrdersModal from '../components/order_modal'; // 파일 경로에 맞게 수정


export default function OwnerDashboard() {
  const { storeId: storeIdFromURL } = useParams();
  const [storeId, setStoreId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menus, setMenus] = useState([]);
  const navigate = useNavigate();
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  
  const onCouponClick = () => {
  navigate(`/owner/${storeId}/coupon`);
  };

  // ✅ fetchMenus useCallback으로 정의
  const fetchMenus = useCallback(async () => {
    if (!storeId) return;
    const res = await fetch(`http://localhost:8080/api/Store/Menu?StoreNumber=${storeId}`);
    const data = await res.json();
    setMenus(data);
  }, [storeId]);

  // ✅ 메뉴 등록 후 처리 함수
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

  // ✅ fetchMenus 의존성 포함
  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return (
    <div className="p-4">
      <DashboardHeader />
      <DashboardMenu
        onAddMenuClick={() => setShowAddModal(true)}
        onSalesClick={() => setShowSalesModal(true)}
        onOrdersClick={() => setShowOrdersModal(true)}
        onCouponClick={onCouponClick}
      />
      <MenuList menus={menus} storeId={storeId} setMenus={setMenus} onEdit={setEditingMenu} />
      {showAddModal && (
        <AddMenuModal
          storeId={storeId}
          onClose={() => setShowAddModal(false)}
          onAdded={handleMenuAdded}
        />
      )}
      {editingMenu && (
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
      {showSalesModal && (
        <SalesModal onClose={() => setShowSalesModal(false)} />
      )}

      {showOrdersModal && (
        <OrdersModal storeId={storeId} onClose={() => setShowOrdersModal(false)} />
      )}

    </div>
  );
}

function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const formattedDate = currentTime.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
  });
  const formattedTime = currentTime.toLocaleTimeString('ko-KR');
  return (
    <div className="flex justify-center p-2 bg-gray-800 text-white">
      <div>영업일자: {formattedDate}  {formattedTime}</div>
    </div>
  );
}

function ToggleButton({ storeId, menuId, isAvailable, onToggled }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/store/${storeId}/menus/${menuId}/availability`,
        {
          method: 'PATCH',
          credentials: 'include',
        }
      );
      if (!res.ok) throw new Error('토글 실패');

      await onToggled(); // 토글 후 목록 다시 불러오기
    } catch (err) {
      console.error('❌ 상태 토글 실패:', err);
      alert('상태 변경 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-1 rounded text-sm transition ${
        isAvailable ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'
      }`}
    >
      {loading ? '...' : isAvailable ? 'ON' : 'OFF'}
    </button>
  );
}


function DashboardMenu({ onAddMenuClick, onSalesClick, onOrdersClick, onCouponClick }) {
  return (
    <div className="flex space-x-2 p-2">
      <button onClick={onAddMenuClick} className="px-4 py-2 bg-green-400 text-white rounded">
        메뉴 추가
      </button>
      <SalesStatsButton onClick={onSalesClick} />
      <button onClick={onOrdersClick} className="px-4 py-2 bg-purple-500 text-white rounded">
        주문 현황
      </button>
      <button onClick={onCouponClick} className="px-4 py-2 bg-pink-500 text-white rounded">
        쿠폰 관리
      </button>

    </div>
  );
}


function SalesStatsButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      매출 통계
    </button>
  );
}



function MenuList({ menus, storeId, setMenus, onEdit }) {
  const handleDelete = async (menuId) => {
    if (!window.confirm('정말로 이 메뉴를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/store/${storeId}/menus/${menuId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('삭제 실패');

      const updatedMenus = await fetch(
        `http://localhost:8080/api/Store/Menu?StoreNumber=${storeId}`
      ).then(res => res.json());
      setMenus(updatedMenus);
    } catch (err) {
      console.error('❌ 삭제 실패:', err);
      alert('삭제 중 오류 발생');
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">📋 등록된 메뉴 목록</h2>
      <ul className="grid grid-cols-2 gap-4">
        {menus.map(menu => (
          <li key={menu.id} className="flex bg-white rounded shadow p-4 justify-between gap-4">
            <div className="flex gap-4">
              <img
                src={menu.imageUrl}
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
                onClick={() => handleDelete(menu.menuId)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                삭제
              </button>
              <ToggleButton
  storeId={storeId}
  menuId={menu.menuId}
  isAvailable={menu.available} // 혹은 menu.isAvailable
  onToggled={async () => {
    const updatedMenus = await fetch(
      `http://localhost:8080/api/Store/Menu?StoreNumber=${storeId}`
    ).then(res => res.json());
    setMenus(updatedMenus);
  }}
/>

            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AddMenuModal({ storeId, onClose, onAdded }) {
  const [form, setForm] = useState({ menuName: '', description: '', price: '', category: '' });
  const [image, setImage] = useState(null);

  const handleSubmit = async () => {
    if (!form.menuName || !form.description || !form.price || !form.category) {
      alert('모든 필드를 작성해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('menuName', form.menuName);
    formData.append('description', form.description);
    formData.append('price', form.price.toString());
    formData.append('category', form.category);
    if (image) formData.append('image', image);

    try {
      const res = await fetch(`http://localhost:8080/api/store/${storeId}/menus`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('등록 실패');
      alert('메뉴가 등록되었습니다.');
      onAdded(); // ✅ 성공 시 fetchMenus 실행
    } catch (err) {
      console.error('❌ 메뉴 등록 실패:', err);
      alert('오류 발생');
    }
  };

  return (
    <Modal title="메뉴 추가" form={form} setForm={setForm} image={image} setImage={setImage} onClose={onClose} onSubmit={handleSubmit} />
  );
}

function EditMenuModal({ storeId, menu, onClose, onUpdated }) {
  const [form, setForm] = useState({
    menuName: menu.menuName,
    description: menu.description,
    price: menu.price,
    category: menu.category,
  });
  const [image, setImage] = useState(null);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('menuName', form.menuName);
    formData.append('description', form.description);
    formData.append('price', form.price.toString());
    formData.append('category', form.category);
    if (image) formData.append('image', image);

    try {
      const res = await fetch(`http://localhost:8080/api/store/${storeId}/menus/${menu.menuId}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('수정 실패');

      const updatedMenus = await fetch(
        `http://localhost:8080/api/Store/Menu?StoreNumber=${storeId}`
      ).then(res => res.json());

      alert('메뉴가 수정되었습니다.');
      onUpdated(updatedMenus);
    } catch (err) {
      console.error('❌ 메뉴 수정 실패:', err);
      alert('오류 발생');
    }
  };

  return (
    <Modal title="메뉴 수정" form={form} setForm={setForm} image={image} setImage={setImage} onClose={onClose} onSubmit={handleSubmit} />
  );
}

function Modal({ title, form, setForm, image, setImage, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <div className="space-y-2">
          <input className="w-full border p-2 rounded" placeholder="이름" value={form.menuName} onChange={e => setForm({ ...form, menuName: e.target.value })} />
          <input className="w-full border p-2 rounded" placeholder="설명" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <input className="w-full border p-2 rounded" placeholder="가격" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <input className="w-full border p-2 rounded" placeholder="카테고리" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <input className="w-full border p-2 rounded" type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>취소</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onSubmit}>확인</button>
        </div>
      </div>
    </div>
  );
}

function SalesModal({ onClose }) {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily'); // 기본값: 오늘
  const totalRevenueSum = useMemo(() => {
  return statistics.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
}, [statistics]);

  useEffect(() => {
    fetch(`http://localhost:8080/statistics/store?period=${period}`, {
      method: 'GET',
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) throw new Error('통계 조회 실패');
        return res.json();
      })
      .then((data) => {
        setStatistics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('매출 통계 오류:', err);
        setLoading(false);
      });
  }, [period]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-[600px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">매출 통계</h2>

        {/* 🔘 기간 선택 버튼 */}
        <div className="flex gap-2 mb-4">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                setLoading(true);
              }}
              className={`px-3 py-1 rounded ${
                period === p ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
              }`}
            >
              {p === 'daily' ? '오늘' : p === 'weekly' ? '이번 주' : '이번 달'}
            </button>
          ))}
        </div>

        {/* 📊 데이터 출력 */}
        {loading ? (
          <p>불러오는 중...</p>
        ) : statistics.length === 0 ? (
          <p>데이터가 없습니다.</p>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="border px-2 py-1">이미지</th>
                <th className="border px-2 py-1">메뉴 이름</th>
                <th className="border px-2 py-1">판매 수량</th>
                <th className="border px-2 py-1">총 매출액</th>
              </tr>
            </thead>
            <tbody>
              {statistics.map((item, i) => (
                <tr key={i} className="text-center">
                  <td className="border px-2 py-1">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.menuName}
                        className="w-16 h-12 object-cover rounded mx-auto"
                      />
                    ) : (
                      <span className="text-gray-400">없음</span>
                    )}
                  </td>
                  <td className="border px-2 py-1">{item.menuName}</td>
                  <td className="border px-2 py-1">{item.totalQuantity}</td>
                  <td className="border px-2 py-1">
                    ₩{item.totalRevenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
        )}

        <div className="mt-4 text-right font-semibold text-lg">
          총 매출합: ₩{totalRevenueSum.toLocaleString()}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}


