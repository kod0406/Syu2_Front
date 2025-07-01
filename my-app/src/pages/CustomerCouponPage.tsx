import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../API/TokenConfig';
import MyCouponList, { MyCoupon } from '../Customer/MyCouponList';
import AvailableCouponList, { AvailableCoupon } from '../Customer/AvailableCouponList';
import Modal from '../pages/Modal';

export default function CustomerCouponPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'available'>('my');
  const [myCoupons, setMyCoupons] = useState<MyCoupon[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [issuedCouponIds, setIssuedCouponIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);


  const fetchMyCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/customer/my-coupons');
      setMyCoupons(response.data);
    } catch (error) {
      console.error('❌ 내 쿠폰 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableCoupons = useCallback(async () => {
    setLoading(true);
    try {
      // 발급된 쿠폰을 확인하기 위해 내 쿠폰 목록도 함께 조회합니다.
      const [myCouponsResponse, availableCouponsResponse] = await Promise.all([
        api.get('/api/customer/my-coupons'),
        api.get('/api/customer/coupons/available')
      ]);
      const issuedIds = new Set<number>(myCouponsResponse.data.map((c: any) => Number(c.couponId)));
      setIssuedCouponIds(issuedIds);
      setAvailableCoupons(availableCouponsResponse.data);
    } catch (error) {
      console.error('❌ 발급 가능 쿠폰 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 탭이 변경될 때마다 해당 데이터를 새로고침합니다.
  useEffect(() => {
    if (activeTab === 'my') {
      fetchMyCoupons();
    } else {
      fetchAvailableCoupons();
    }
  }, [activeTab, fetchMyCoupons, fetchAvailableCoupons]);

  const handleIssueCoupon = async (couponId: number) => {
    try {
      await api.post(`/api/customer/coupons/${couponId}/issue`);
      setAlertMessage('✅ 쿠폰이 성공적으로 발급되었습니다.');
      setOnConfirm(() => () => {
        fetchAvailableCoupons();
        setAlertMessage(null);      // ✅ 모달도 닫아줌
        setOnConfirm(null);         // ✅ confirm도 초기화
      });
      // 쿠폰 발급 후, 발급 가능 목록을 새로고침하여 버튼 상태를 업데이트합니다.
      fetchAvailableCoupons();
    } catch (error: any) {
      console.error('❌ 쿠폰 발급 오류:', error);
      const message = error.response?.data?.message || '쿠폰 발급에 실패했습니다.';
      setAlertMessage(`❌ 발급 실패: ${message}`);
      setOnConfirm(null);

    }
  };

  return (
    <>
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">🎟️ 내 쿠폰함</h1>

      <div className="flex justify-center border-b mb-4">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-6 py-2 font-semibold ${activeTab === 'my' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>
          보유 쿠폰
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`px-6 py-2 font-semibold ${activeTab === 'available' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>
          쿠폰 받기
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-8 animate-pulse">
          <svg className="w-10 h-10 text-blue-400 animate-spin mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <p className="text-center text-blue-500 font-semibold">쿠폰을 불러오는 중...</p>
        </div>
      ) : (
        <div className="transition-opacity duration-700 opacity-100 animate-fade-in">
          {activeTab === 'my' && <MyCouponList coupons={myCoupons} />}
          {activeTab === 'available' && <AvailableCouponList coupons={availableCoupons} onIssue={handleIssueCoupon} issuedCouponIds={issuedCouponIds} />}
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate(-1)} // Go back to the previous page
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
          ← 돌아가기
        </button>
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
  />
)}
</>
  );
}
