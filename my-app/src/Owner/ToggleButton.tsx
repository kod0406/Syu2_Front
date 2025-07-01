import React, { useState } from 'react';
import api from '../API/TokenConfig';
import Modal from '../pages/Modal';

interface ToggleButtonProps {
  storeId: number;
  menuId: number;
  isAvailable: boolean;
  onToggled: () => Promise<void>;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ storeId, menuId, isAvailable, onToggled }) => {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await api.patch(
        `/api/store/${storeId}/menus/${menuId}/availability`
      );
      await onToggled();
    } catch (err) {
      console.error('❌ 상태 토글 실패:', err);
      setAlertMessage('❌ 상태 변경 중 오류 발생');
      setOnConfirm(null);

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-1 rounded text-sm transition ${
        isAvailable ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'
      }`}
    >
      {loading ? '...' : isAvailable ? 'ON' : 'OFF'}
    </button>
    {alertMessage && (
  <Modal
    title="알림"
    message={alertMessage}
    onClose={() => {
      setAlertMessage(null);
      setOnConfirm(null);
    }}
    onConfirm={onConfirm ?? undefined}
    confirmText="확인"
  />
)}
</>
  );
};

export default ToggleButton;
