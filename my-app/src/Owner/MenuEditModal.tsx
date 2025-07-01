import React, { useState } from 'react';
import api from '../API/TokenConfig';

interface Props {
  storeId: number;
  menu: {
    menuId: number;
    menuName: string;
    description: string;
    price: number;
    category: string;
  };
  onClose: () => void;
  onUpdated: (updatedMenus: any[]) => void;
}

const EditMenuModal: React.FC<Props> = ({ storeId, menu, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    menuName: menu.menuName,
    description: menu.description,
    price: menu.price,
    category: menu.category,
  });
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('menuName', form.menuName);
    formData.append('description', form.description);
    formData.append('price', form.price.toString());
    formData.append('category', form.category);
    if (image) formData.append('image', image);

    try {
      await api.put(`/api/store/${storeId}/menus/${menu.menuId}`, formData, { headers: {
        'Content-Type': 'multipart/form-data'
        }
    });

      const res = await api.get(
        `/api/Store/Menu?StoreNumber=${storeId}`
      );
      const updatedMenus = res.data;

      alert('메뉴가 수정되었습니다.');
      onUpdated(updatedMenus);
    } catch (err) {
      console.error('❌ 메뉴 수정 실패:', err);
      alert('오류 발생');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-lg font-bold mb-4">메뉴 수정</h2>
        <div className="space-y-2">
          <input
            className="w-full border p-2 rounded"
            placeholder="이름"
            value={form.menuName}
            onChange={e => setForm({ ...form, menuName: e.target.value })}
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="설명"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="가격"
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: Number(e.target.value) })}
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="카테고리"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
          />
          <input
            className="w-full border p-2 rounded"
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0] || null)}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>취소</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSubmit}>수정</button>
        </div>
      </div>
    </div>
  );
};

export default EditMenuModal;
