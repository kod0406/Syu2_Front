import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const target = sessionStorage.getItem("qr-redirect-url");
    if (target) {
      // ✅ 자동으로 QR 경로로 이동
      // sessionStorage.removeItem('qr-redirect-url'); // 한 번 쓰고 제거해도 됨
      navigate(target);
    }
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>Syu2 - 스마트 주문 서비스</title>
      </Helmet>
      <div className="text-center p-10">
        <p>로그인 완료. 페이지 이동 중...</p>
      </div>
    </>
  );
}
