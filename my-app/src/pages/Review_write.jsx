'use client';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // ✅ 쿼리 읽기용

export default function ReviewWritePage() {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState([]);
  const [statId, setStatId] = useState('');

  const location = useLocation();

  // ✅ 쿼리에서 statId 추출
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromQuery = params.get('statId');
    if (idFromQuery) setStatId(idFromQuery);
  }, [location.search]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files.slice(0, 5)); // 최대 5장 제한
  };

  const handleSubmit = async () => {
    if (!statId || !rating || !reviewText) {
      alert('모든 필드를 작성해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('statId', statId);
    formData.append('date', new Date().toISOString());
    formData.append('rating', rating);
    formData.append('reviewText', reviewText);
    images.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const res = await fetch('http://localhost:8080/review/submit', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) throw new Error('서버 오류');
      alert('리뷰가 등록되었습니다.');
      window.location.href = '/review';
    } catch (err) {
      console.error('❌ 리뷰 전송 실패:', err);
      alert('리뷰 작성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">리뷰 작성</h2>

      {/* 통계번호는 숨김 */}
      <input type="hidden" value={statId} />

      <div className="mb-4">
        <label className="block font-semibold mb-1">별점</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setRating(num)}
              className={`text-2xl ${rating >= num ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">리뷰 내용</label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="w-full p-2 border rounded h-24 resize-none"
          placeholder="리뷰를 작성해주세요."
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">음식 사진 첨부 (최대 5장)</label>
        <input type="file" accept="image/*" multiple onChange={handleImageChange} />
        <div className="flex gap-2 mt-2 flex-wrap">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={URL.createObjectURL(img)}
              alt="preview"
              className="w-20 h-20 object-cover rounded border"
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        리뷰 작성 완료
      </button>
    </div>
  );
}
