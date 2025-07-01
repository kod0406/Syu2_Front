import React from 'react';

interface AlertModalProps {
  title?: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const AlertModal: React.FC<AlertModalProps> = ({
  title = '알림',
  message,
  onClose,
  onConfirm,
  confirmText = '확인',
  cancelText = '취소',
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-sm">
        <h2 className="text-lg font-semibold mb-3">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          {onConfirm && (
            <button
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}
          <button
            className="px-4 py-2 bg-pink-600 text-white rounded"
            onClick={() => {
              if (onConfirm) onConfirm();
              else onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
