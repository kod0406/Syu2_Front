import React, { useState } from 'react';

interface Props {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onNavigateMyPage: () => void;
}

export default function CategorySidebar({
  categories,
  selectedCategory,
  setSelectedCategory,
  onNavigateMyPage,
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
                    ? 'bg-red-500 text-white'
                    : 'text-red-500 hover:font-semibold'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-4 p-2">
          <button
            onClick={onNavigateMyPage}
            className="w-full h-24 border-2 border-red-500 text-red-500 rounded"
          >
            마이페이지
          </button>
        </div>
      </aside>

      {/* 모바일 드롭다운 메뉴 */}
      <div className="md:hidden bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">메뉴</h1>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-red-500 font-semibold"
          >
            {isOpen ? '닫기 ▲' : '카테고리 ▼'}
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
                    ? 'bg-red-500 text-white'
                    : 'text-red-500 hover:font-semibold'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={onNavigateMyPage}
              className="mt-4 w-full h-12 border-2 border-red-500 text-red-500 rounded"
            >
              마이페이지
            </button>
          </div>
        )}
      </div>
    </>
  );
}
