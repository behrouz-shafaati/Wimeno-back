import { Id, Model } from "@core/interface";

export type Product = Model & {
  userId: Id;
  shopId: Id;
  name: string;
  description: string;
  images: Id[];
  price: number;
  priceSale: number;
  inStock: boolean;
  category: Id;
  active: boolean;
};

export type ProductPayload = Omit<Product, "id" | "active">;
