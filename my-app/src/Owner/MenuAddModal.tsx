import React, { useState, useEffect } from "react";
import api from "../API/TokenConfig";
import Modal from "../pages/Modal";

type Props = {
  storeId: number;
  onClose: () => void;
  onAdded: () => void;
};

const AddMenuModal: React.FC<Props> = ({ storeId, onClose, onAdded }) => {
  const [form, setForm] = useState({
    menuName: "",
    description: "",
    price: "",
    category: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    // 컴포넌트 마운트 시 스크롤 막기
    document.body.style.overflow = "hidden";

    // 컴포넌트 언마운트 시 스크롤 복구
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = async () => {
    if (!form.menuName || !form.description || !form.price || !form.category) {
      setAlertMessage("모든 정보를 작성해주세요.");
      setOnConfirm(null);
      return;
    }

    const formData = new FormData();
    formData.append("menuName", form.menuName);
    formData.append("description", form.description);
    formData.append("price", form.price.toString());
    formData.append("category", form.category);
    if (image) formData.append("image", image);

    try {
      await api.post(`/api/store/${storeId}/menus`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setAlertMessage("✅ 메뉴가 등록되었습니다.");
      setOnConfirm(() => () => {
        onAdded();
        onClose();
      });
    } catch (err) {
      console.error("❌ 메뉴 등록 실패:", err);
      setAlertMessage("❌ 메뉴 등록 중 오류가 발생했습니다.");
      setOnConfirm(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow w-96">
          <h2 className="text-lg font-bold mb-4">메뉴 추가</h2>
          <div className="space-y-2">
            <input
              className="w-full border p-2 rounded"
              placeholder="이름"
              value={form.menuName}
              onChange={(e) => setForm({ ...form, menuName: e.target.value })}
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="설명"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="가격"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="카테고리"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <input
              className="w-full border p-2 rounded"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
              취소
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleSubmit}
            >
              확인
            </button>
          </div>
        </div>
      </div>
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
          // ✅ cancelText 생략
        />
      )}
    </>
  );
};

export default AddMenuModal;
