import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function OwnerDashboard() {
  const storeId = useStoreIdFromParams();
  const [storeInfo, setStoreInfo] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    if (storeId) {
      fetch(`http://localhost:8080/api/stores/${storeId}`)
        .then(res => res.json())
        .then(data => setStoreInfo(data))
        .catch(err => console.error('가게 정보 불러오기 실패:', err));

      fetch(`http://localhost:8080/api/Store/Menu?StoreNumber=${storeId}`)
        .then(res => res.json())
        .then(data => setMenus(data))
        .catch(err => console.error('❌ 메뉴 불러오기 실패:', err.message));
    }
  }, [storeId]);

  return (
    <div className="p-4">
      <DashboardHeader />
      {storeInfo && (
        <div className="text-sm text-gray-600 mb-2">
          📍 가게 이름: <b>{storeInfo.storeName}</b> (ID: {storeId})
        </div>
      )}
      <DashboardMenu onAddMenuClick={() => setShowAddModal(true)} />
      <MenuList menus={menus} storeId={storeId} setMenus={setMenus} />
      {showAddModal && (
        <AddMenuModal storeId={storeId} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function useStoreIdFromParams() {
  const { storeId } = useParams();
  return storeId;
}

function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
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
      <div>
        영업일자: {formattedDate} | 포스번호: 01 | 시간: {formattedTime}
      </div>
    </div>
  );
}

function DashboardMenu({ onAddMenuClick }) {
  return (
    <div className="flex space-x-2 p-2">
      <button onClick={onAddMenuClick} className="px-4 py-2 bg-green-400 text-white rounded">
        메뉴 추가
      </button>
    </div>
  );
}

function MenuList({ menus, storeId, setMenus }) {
  const handleDelete = async (menuId) => {
    const confirmDelete = window.confirm('정말로 이 메뉴를 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      // ✅ 정확한 DELETE URL 사용
      const res = await fetch(`http://localhost:8080/api/store/${storeId}/menus/${menuId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('삭제 실패');

      // ✅ 삭제 성공 후 목록 다시 불러오기
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
          <li key={menu.id} className="flex bg-white rounded shadow p-4 items-start gap-4 justify-between">
            <div className="flex gap-4">
              <img
                src={menu.imageUrl}
                alt={menu.menuName}
                className="w-28 h-24 object-cover rounded"
              />
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold">{menu.menuName}</h3>
                  <p className="text-red-600 font-semibold">₩{menu.price?.toLocaleString()}</p>
                  <p className="text-gray-500 text-sm">{menu.description}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="px-3 py-1 bg-yellow-400 text-white rounded text-sm">수정</button>
              <button
                onClick={() => handleDelete(menu.menuId)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AddMenuModal({ storeId, onClose }) {
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
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await fetch(`http://localhost:8080/api/store/${storeId}/menus`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) throw new Error('등록 실패');

      alert('메뉴가 등록되었습니다.');
      onClose();
    } catch (err) {
      console.error('❌ 메뉴 등록 실패:', err);
      alert('오류 발생');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-lg font-bold mb-4">메뉴 추가</h2>
        <div className="space-y-2">
          <input className="w-full border p-2 rounded" placeholder="이름" value={form.menuName} onChange={e => setForm({ ...form, menuName: e.target.value })} />
          <input className="w-full border p-2 rounded" placeholder="설명" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <input className="w-full border p-2 rounded" placeholder="가격" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <input className="w-full border p-2 rounded" placeholder="카테고리" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <input className="w-full border p-2 rounded" type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>취소</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSubmit}>등록</button>
        </div>
      </div>
    </div>
  );
}
