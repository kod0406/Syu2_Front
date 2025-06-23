// src/Owner/MenuAddModal.tsx

import React, { useState } from 'react';

type MenuAddModalProps = {
  onClose: () => void;
  onAddComplete: () => void;
};

export default function MenuAddModal({ onClose, onAddComplete }: MenuAddModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async () => {
    const newMenu = {
      name,
      price: Number(price),
      description,
      imageUrl,
    };

    try {
      await fetch('http://localhost:8080/api/Store/Menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMenu),
      });
      onAddComplete();
    } catch (err) {
      alert('메뉴 추가 실패');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96 space-y-4">
        <h2 className="text-xl font-bold mb-2">메뉴 추가</h2>
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
            등록
          </button>
        </div>
      </div>
    </div>
  );
}
