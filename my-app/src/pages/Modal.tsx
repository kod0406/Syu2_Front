import React from "react";
import { createPortal } from "react-dom";

interface GlobalModalProps {
  title?: string;
  message: React.ReactNode;
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
  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[99999] backdrop-blur-md"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="bg-white rounded-xl p-6 w-[95%] max-w-4xl max-h-[90vh] shadow-2xl relative overflow-hidden animate-fadeIn border border-gray-200"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', zIndex: 100000 }}
      >
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 absolute top-4 right-4 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-thin scrollbar-thumb-gray-300 pr-2">
          {message}
        </div>
        <div className="flex justify-end space-x-3 bg-white pt-4 border-t border-gray-100 mt-4">
          {cancelText && onConfirm && (
            <button
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
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

  // Portal을 사용해서 document.body에 직접 렌더링
  return createPortal(modalContent, document.body);
};

export default GlobalModal;
