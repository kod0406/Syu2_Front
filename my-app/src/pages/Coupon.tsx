import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CouponCreateModal from '../Coupon/CouponCreateModal';

interface CouponForm {
  couponName: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: string;
  discountLimit: string;
  minimumOrderAmount: string;
  expiryDate: string;
  expiryDays: string;
  issueStartTime: string;
  totalQuantity: string;
  applicableCategories: string;
}

export default function CouponCreatePage() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const [showModal, setShowModal] = useState(false);
  const [expiryType, setExpiryType] = useState<'ABSOLUTE' | 'RELATIVE'>('ABSOLUTE');
  const [form, setForm] = useState<CouponForm>({
    couponName: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    discountLimit: '',
    minimumOrderAmount: '',
    expiryDate: '',
    expiryDays: '',
    issueStartTime: '',
    totalQuantity: '',
    applicableCategories: '',
  });

  const handleSubmit = async () => {
    const payload = {
      couponName: form.couponName,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      discountLimit: form.discountLimit ? Number(form.discountLimit) : null,
      minimumOrderAmount: Number(form.minimumOrderAmount),
      expiryType,
      expiryDate: expiryType === 'ABSOLUTE' ? form.expiryDate : null,
      expiryDays: expiryType === 'RELATIVE' ? Number(form.expiryDays) : null,
      issueStartTime: form.issueStartTime,
      totalQuantity: Number(form.totalQuantity),
      applicableCategories: form.applicableCategories
        .split(',')
        .map(cat => cat.trim())
        .filter(Boolean),
    };

    try {
      const response = await fetch('http://localhost:8080/api/store/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        alert(`❌ 생성 실패: ${message}`);
        return;
      }

      const data = await response.json();
      alert('✅ 쿠폰이 성공적으로 생성되었습니다.');
      console.log('생성된 쿠폰:', data);
      setShowModal(false);
    } catch (error) {
      console.error('쿠폰 생성 오류:', error);
      alert('❌ 네트워크 오류 또는 서버 내부 오류');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🎟️ 쿠폰 관리</h1>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-pink-600 text-white rounded"
      >
        쿠폰 생성하기
      </button>

      {showModal && (
        <CouponCreateModal
          form={form}
          setForm={setForm}
          expiryType={expiryType}
          setExpiryType={setExpiryType}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate(`/owner/dashboard/${storeId}`)}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          ← 돌아가기
        </button>
      </div>
    </div>
  );
}
