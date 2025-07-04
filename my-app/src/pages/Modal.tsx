import React from "react";

interface GlobalModalProps {
  title?: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string; // 전달하지 않으면 취소 버튼 안 뜸
}

const GlobalModal: React.FC<GlobalModalProps> = ({
  title = "알림",
  message,
  onClose,
  onConfirm,
  confirmText = "확인",
  cancelText, // 기본값 제거: 없으면 버튼 숨김
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-[90%] max-w-sm shadow-lg">
        <h2 className="text-lg font-bold mb-3">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          {cancelText && onConfirm && (
            <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
              {cancelText}
            </button>
          )}
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
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

export default GlobalModal;
