import React, { useState } from 'react';

interface ToggleButtonProps {
  storeId: number;
  menuId: number;
  isAvailable: boolean;
  onToggled: () => Promise<void>;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ storeId, menuId, isAvailable, onToggled }) => {
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

      await onToggled();
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
};

export default ToggleButton;
