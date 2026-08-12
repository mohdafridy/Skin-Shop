import type { Database, Tables } from "@/lib/database.types";

export type { Database };

export type Product = Tables<"products">;
export type Category = Tables<"categories">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  unitPriceCents: number;
  quantity: number;
};
