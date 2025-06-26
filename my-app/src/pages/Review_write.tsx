'use client';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../API/TokenConfig';

interface UserInfo {
  id: number;
  email: string;
  name: string;
}

export default function ReviewWritePage() {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [statId, setStatId] = useState('');
  const [user, setUser] = useState<UserInfo | null>(null);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromQuery = params.get('statId');
    if (idFromQuery) setStatId(idFromQuery);

    api.get('/auth/me')
      .then(res => {
        if (res.data.data) setUser(res.data.data);
      })
      .catch(err => {
        console.error('❌ 사용자 정보 불러오기 실패:', err);
      });
  }, [location.search]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setImages(files.slice(0, 5));
  };

  const handleSubmit = async () => {
    if (!statId || !rating || !reviewText) {
      alert('모든 필드를 작성해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('statisticsId', statId);
    formData.append('date', new Date().toISOString().split('T')[0]);
    formData.append('reviewRating', String(rating));
    formData.append('comment', reviewText);

    if (images.length > 0) {
      formData.append('images', images[0]); // 여러 장 업로드하려면 반복문 필요
    }

    try {
      const res = await api.post('api/review/write', formData);
      if (res.status !== 200) throw new Error('서버 오류');
      alert('리뷰가 등록되었습니다.');
      window.location.href = '/review';
    } catch (err) {
      console.error('❌ 리뷰 전송 실패:', err);
      alert('리뷰 작성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 md:p-6 bg-white shadow rounded">
      <h2 className="text-xl md:text-2xl font-bold mb-4">리뷰 작성</h2>

      <input type="hidden" value={statId} />

      <div className="mb-4">
        <label className="block font-semibold mb-1 text-sm">별점</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setRating(num)}
              className={`text-xl md:text-2xl ${rating >= num ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1 text-sm">리뷰 내용</label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="w-full p-2 border rounded h-24 resize-none text-sm"
          placeholder="리뷰를 작성해주세요."
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1 text-sm">음식 사진 첨부 (최대 5장)</label>
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
        className="w-full bg-blue-500 text-white py-2.5 rounded hover:bg-blue-600 text-sm font-semibold"
      >
        리뷰 작성 완료
      </button>
    </div>
  );
}
