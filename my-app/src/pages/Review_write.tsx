"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import api from "../API/TokenConfig";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "../pages/Modal";

interface UserInfo {
  id: number;
  email: string;
  name: string;
}

export default function ReviewWritePage() {
  const { statisticsId } = useParams<{ statisticsId: string }>();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [statId, setStatId] = useState("");
  const [user, setUser] = useState<UserInfo | null>(null);
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (statisticsId) {
      setStatId(statisticsId);
    }

    api
      .get("/auth/me")
      .then((res) => {
        if (res.data.data) setUser(res.data.data);
      })
      .catch((err) => {
        console.error("❌ 사용자 정보 불러오기 실패:", err);
      });
  }, [statisticsId]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImages([files[0]]);
    }
  };

  const handleSubmit = async () => {
    if (!statId || !rating || !reviewText) {
      setAlertMessage("모든 필드를 작성해주세요.");
      setOnConfirm(null);
      return;
    }

    const formData = new FormData();
    formData.append("statisticsId", String(Number(statId)));
    formData.append("date", new Date().toISOString().split("T")[0]);
    formData.append("reviewRating", String(rating));
    formData.append("comment", reviewText);

    if (images.length > 0) {
      formData.append("image", images[0]);
    }

    console.log("📦 전송할 formData 내용 확인:");
    for (const [key, value] of formData.entries()) {
      console.log(`🧾 ${key}:`, value);
    }

    try {
      const res = await api.post("api/review/write", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status !== 200) throw new Error("서버 오류");
      setAlertMessage("리뷰가 등록되었습니다.");
      setOnConfirm(() => () => {
        window.location.href = "/review";
      });
    } catch (err) {
      console.error("❌ 리뷰 전송 실패:", err);
      setAlertMessage("리뷰 작성 중 오류가 발생했습니다.");
      setOnConfirm(null);
    }
  };

  return (
    <>
      <div className="w-full max-w-xl mx-auto p-4 md:p-6 bg-white shadow rounded">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">리뷰 작성</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1 bg-gray-300 text-black rounded text-sm hover:bg-gray-400"
          >
            ← 돌아가기
          </button>
        </div>

        {user && (
          <div className="mb-4 text-sm text-gray-600">
            ✍️ 작성자: <span className="font-medium">{user.name}</span>
          </div>
        )}

        <input type="hidden" value={statId} />

        <div className="mb-4">
          <label className="block font-semibold mb-1 text-sm">별점</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setRating(num)}
                className={`text-xl md:text-2xl ${
                  rating >= num ? "text-yellow-400" : "text-gray-300"
                }`}
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
          <label className="block font-semibold mb-1 text-sm">
            음식 사진 첨부 (1장만)
          </label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
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
      {alertMessage && (
        <Modal
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
