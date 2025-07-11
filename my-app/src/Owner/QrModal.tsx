import React, { useEffect } from "react";

type QRModalProps = {
  base64: string;
  onClose: () => void;
};

const QRModal: React.FC<QRModalProps> = ({ base64, onClose }) => {
  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    // 컴포넌트 마운트 시 스크롤 막기
    document.body.style.overflow = 'hidden';

    // 컴포넌트 언마운트 시 스크롤 복구
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-lg font-semibold mb-4">QR 코드 미리보기</h2>
        <img
          src={`data:image/png;base64,${base64}`}
          alt="QR Code"
          className="w-48 h-48 mx-auto"
        />
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default QRModal;
