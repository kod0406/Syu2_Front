// src/Owner/types.ts

// 메뉴 타입

export type Menu = {
  menuId: number;
  menuName: string;
  price: number;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  category?: string; // ✅ 이 줄 추가
};


// 주문 관련 타입
export type OrderItem = {
  menuName: string;
  quantity: number;
  price: number;
};

export type OrderGroup = {
  orderGroupId: number;
  items: OrderItem[];
};

export type OrderData = {
  groups: OrderGroup[];
};

// 매출 관련 타입
export type DailySales = {
  date: string;
  totalSales: number;
};
