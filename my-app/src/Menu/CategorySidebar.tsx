import React from 'react';

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
  return (
    <aside className="w-1/6 bg-white border-r p-4 flex flex-col h-full justify-between">
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
  );
}
