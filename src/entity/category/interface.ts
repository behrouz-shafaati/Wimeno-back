import { Id, Model } from "@core/interface";

export type Category = Model & {
  parentId: Id;
  title: string;
  description: string;
  avatar: Id;
  active: boolean;
};

export type CategoryPayload = Omit<Category, "id" | "active">;
