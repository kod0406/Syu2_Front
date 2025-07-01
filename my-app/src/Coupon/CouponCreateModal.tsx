import React from 'react';

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

interface Props {
  form: CouponForm;
  setForm: React.Dispatch<React.SetStateAction<CouponForm>>;
  expiryType: 'ABSOLUTE' | 'RELATIVE';
  setExpiryType: (type: 'ABSOLUTE' | 'RELATIVE') => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function CouponCreateModal({
  form,
  setForm,
  expiryType,
  setExpiryType,
  onSubmit,
  onClose,
}: Props) {
  const handleInput = (field: keyof CouponForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">쿠폰 정보 입력</h2>

        <input className="w-full mb-2 border p-2 rounded" placeholder="쿠폰 이름"
          value={form.couponName} onChange={e => handleInput('couponName', e.target.value)} />

        <select className="w-full mb-2 border p-2 rounded"
          value={form.discountType} onChange={e => handleInput('discountType', e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT')}>
          <option value="PERCENTAGE">할인율</option>
          <option value="FIXED_AMOUNT">정액 할인</option>
        </select>

        <input className="w-full mb-2 border p-2 rounded" placeholder="할인값"
          type="number" value={form.discountValue} onChange={e => handleInput('discountValue', e.target.value)} />
        <input className="w-full mb-2 border p-2 rounded" placeholder="최대 할인 금액"
          type="number" value={form.discountLimit} onChange={e => handleInput('discountLimit', e.target.value)} />
        <input className="w-full mb-2 border p-2 rounded" placeholder="최소 주문 금액"
          type="number" value={form.minimumOrderAmount} onChange={e => handleInput('minimumOrderAmount', e.target.value)} />

        <label className="block mb-1 font-semibold">발급 시작 시간</label>
        <input type="datetime-local" className="w-full mb-2 border p-2 rounded"
          value={form.issueStartTime} onChange={e => handleInput('issueStartTime', e.target.value)} />

        <input className="w-full mb-2 border p-2 rounded" placeholder="발급 수량"
          type="number" value={form.totalQuantity} onChange={e => handleInput('totalQuantity', e.target.value)} />
        <input className="w-full mb-2 border p-2 rounded" placeholder="적용 카테고리 (쉼표 구분)"
          value={form.applicableCategories} onChange={e => handleInput('applicableCategories', e.target.value)} />

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

        {expiryType === 'ABSOLUTE' ? (
          <>
            <label className="block mb-1 font-semibold">만료일 (절대)</label>
            <input type="datetime-local" className="w-full mb-2 border p-2 rounded"
              value={form.expiryDate} onChange={e => handleInput('expiryDate', e.target.value)} />
          </>
        ) : (
          <input className="w-full mb-2 border p-2 rounded" placeholder="만료일 수 (예: 30)"
            type="number" value={form.expiryDays} onChange={e => handleInput('expiryDays', e.target.value)} />
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>취소</button>
          <button className="px-4 py-2 bg-pink-600 text-white rounded" onClick={onSubmit}>생성</button>
        </div>
      </div>
    </div>
  );
}
