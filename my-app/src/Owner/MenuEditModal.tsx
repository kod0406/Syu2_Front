// src/Owner/MenuEditModal.tsx

import React, { useState, useEffect } from 'react';
import { Menu } from './types'; // 또는 '../Owner/types'

type MenuEditModalProps = {
  menu: Menu;
  onClose: () => void;
  onEditComplete: () => void;
};

export default function MenuEditModal({ menu, onClose, onEditComplete }: MenuEditModalProps) {
  const [name, setName] = useState(menu.name);
  const [price, setPrice] = useState(String(menu.price));
  const [description, setDescription] = useState(menu.description || '');
  const [imageUrl, setImageUrl] = useState(menu.imageUrl || '');

  const handleSubmit = async () => {
    const updatedMenu = {
      id: menu.id,
      name,
      price: Number(price),
      description,
      imageUrl,
    };

    try {
      await fetch(`http://localhost:8080/api/Store/Menu/${menu.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMenu),
      });
      onEditComplete();
    } catch (err) {
      alert('메뉴 수정 실패');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96 space-y-4">
        <h2 className="text-xl font-bold mb-2">메뉴 수정</h2>
        <input
          type="text"
          placeholder="메뉴 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="number"
          placeholder="가격"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="text"
          placeholder="설명"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="text"
          placeholder="이미지 URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full border rounded p-2"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:underline">취소</button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
