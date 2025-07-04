export interface CustomerCoupon {
  id: string; // UUID
  couponId: number;
  couponName: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minimumOrderAmount?: number;
  discountLimit?: number;
  applicableCategories?: string[];
  issuedAt: string; // ISO 8601 date string
  expiresAt: string; // ISO 8601 date string
  isUsed: boolean;
  storeName: string;
}
