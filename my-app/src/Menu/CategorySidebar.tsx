"use client";

import React, { useState } from "react";

interface Props {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onNavigateMyPage: () => void;
  onNavigateCouponPage: () => void;
  isLoggedIn: boolean; // ✅ 추가
}

export default function CategorySidebar({
  categories,
  selectedCategory,
  setSelectedCategory,
  onNavigateMyPage,
  onNavigateCouponPage,
  isLoggedIn, // ✅ 추가
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 데스크탑 사이드바 */}
      <aside className="hidden md:flex bg-white border-r p-4 flex-col h-full justify-between">
        <div>
          <h1 className="text-xl font-bold mb-4">menu</h1>
          <nav className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`block text-left px-2 py-1 rounded ${
                  selectedCategory === cat
                    ? "bg-red-500 text-white"
                    : "text-red-500 hover:font-semibold"
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        {/* ✅ 데스크탑 - 로그인 사용자만 버튼 렌더링 */}
        {isLoggedIn && (
          <div className="mt-4 flex flex-col gap-2 p-2">
            <button
              onClick={onNavigateMyPage}
              className="h-20 bg-white border border-red-500 text-red-500 rounded-lg text-sm font-semibold shadow hover:bg-red-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5"
            >
              마이페이지
            </button>
            <button
              onClick={onNavigateCouponPage}
              className="h-20 bg-white border border-red-500 text-red-500 rounded-lg text-sm font-semibold shadow hover:bg-red-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5"
            >
              쿠폰발급
            </button>
          </div>
        )}
      </aside>

      {/* 모바일 드롭다운 메뉴 */}
      <div className="md:hidden bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">메뉴</h1>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-red-500 font-semibold"
          >
            {isOpen ? "닫기 ▲" : "카테고리 ▼"}
          </button>
        </div>
        {isOpen && (
          <div className="mt-2 space-y-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-2 py-1 rounded ${
                  selectedCategory === cat
                    ? "bg-red-500 text-white"
                    : "text-red-500 hover:font-semibold"
                }`}
              >
                {cat}
              </button>
            ))}

            {/* ✅ 모바일 - 로그인 사용자만 버튼 렌더링 */}
            {isLoggedIn && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={onNavigateMyPage}
                  className="w-1/2 h-10 bg-white border border-red-500 text-red-500 rounded-lg text-sm font-semibold shadow hover:bg-red-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5"
                >
                  마이페이지
                </button>
                <button
                  onClick={onNavigateCouponPage}
                  className="w-1/2 h-10 bg-white border border-red-500 text-red-500 rounded-lg text-sm font-semibold shadow hover:bg-red-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5"
                >
                  쿠폰발급
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
