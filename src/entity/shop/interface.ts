import { Id, Model } from "@core/interface";

export type Shop = Model & {
  userId: Id;
  title: string;
  shopStringId: string;
  phoneNumber?: string;
  about?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  phone?: string;
  logo?: Id;
  cover?: Id;
  facebookLink?: string;
  instagramLink?: string;
  twitterLink?: string;
  active: boolean;
};

export type IsUserOwnerShopType = {
  userId: Id;
  shopId: Id;
};

export type InitShopLoginPanel = {
  userId: Id;
  shopId: Id | string | null;
};
export type ShopPayload = Omit<Shop, "id" | "active">;
