import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function CouponCreatePage() {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [expiryType, setExpiryType] = useState('ABSOLUTE');
  const [form, setForm] = useState({
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

  const handleCreateCoupon = () => {
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const payload = {
      couponName: form.couponName,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      discountLimit: form.discountLimit ? Number(form.discountLimit) : null,
      minimumOrderAmount: Number(form.minimumOrderAmount),
      expiryType: expiryType,
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

  const handleInput = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🎟️ 쿠폰 관리</h1>
      <button
        onClick={handleCreateCoupon}
        className="px-4 py-2 bg-pink-600 text-white rounded"
      >
        쿠폰 생성하기
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">쿠폰 정보 입력</h2>

            {/* 공통 필드 */}
            <input className="w-full mb-2 border p-2 rounded" placeholder="쿠폰 이름"
              value={form.couponName} onChange={e => handleInput('couponName', e.target.value)} />
            <select className="w-full mb-2 border p-2 rounded"
              value={form.discountType} onChange={e => handleInput('discountType', e.target.value)}>
              <option value="PERCENTAGE">할인율</option>
              <option value="FIXED_AMOUNT">정액 할인</option>
            </select>
            <input className="w-full mb-2 border p-2 rounded" placeholder="할인값"
              type="number" value={form.discountValue} onChange={e => handleInput('discountValue', e.target.value)} />
            <input className="w-full mb-2 border p-2 rounded" placeholder="최대 할인 금액"
              type="number" value={form.discountLimit} onChange={e => handleInput('discountLimit', e.target.value)} />
            <input className="w-full mb-2 border p-2 rounded" placeholder="최소 주문 금액"
              type="number" value={form.minimumOrderAmount} onChange={e => handleInput('minimumOrderAmount', e.target.value)} />

            {/* ✅ 발급 시작 시간 - datetime-local 적용 */}
            <label className="block mb-1 font-semibold">발급 시작 시간</label>
            <input
              type="datetime-local"
              className="w-full mb-2 border p-2 rounded"
              value={form.issueStartTime}
              onChange={(e) => handleInput('issueStartTime', e.target.value)}
            />

            <input className="w-full mb-2 border p-2 rounded" placeholder="발급 수량"
              type="number" value={form.totalQuantity} onChange={e => handleInput('totalQuantity', e.target.value)} />
            <input className="w-full mb-2 border p-2 rounded" placeholder="적용 카테고리 (쉼표 구분)"
              value={form.applicableCategories} onChange={e => handleInput('applicableCategories', e.target.value)} />

            {/* 만료 방식 선택 */}
            <div className="flex gap-2 mt-4 mb-2">
              <button className={`flex-1 py-2 rounded ${expiryType === 'ABSOLUTE' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setExpiryType('ABSOLUTE')}>
                절대 만료일
              </button>
              <button className={`flex-1 py-2 rounded ${expiryType === 'RELATIVE' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setExpiryType('RELATIVE')}>
                상대 만료일
              </button>
            </div>

            {/* ✅ 절대 만료일 - datetime-local 적용 */}
            {expiryType === 'ABSOLUTE' ? (
              <>
                <label className="block mb-1 font-semibold">만료일 (절대)</label>
                <input
                  type="datetime-local"
                  className="w-full mb-2 border p-2 rounded"
                  value={form.expiryDate}
                  onChange={(e) => handleInput('expiryDate', e.target.value)}
                />
              </>
            ) : (
              <input className="w-full mb-2 border p-2 rounded" placeholder="만료일 수 (예: 30)"
                type="number" value={form.expiryDays} onChange={e => handleInput('expiryDays', e.target.value)} />
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowModal(false)}>취소</button>
              <button className="px-4 py-2 bg-pink-600 text-white rounded" onClick={handleSubmit}>생성</button>
            </div>
          </div>
        </div>
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
