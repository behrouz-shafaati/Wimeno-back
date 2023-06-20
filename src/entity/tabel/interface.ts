import { Id, Model } from "@core/interface";

export type Tabel = Model & {
  shopId: Id;
  number: number;
  code: number;
  active: boolean;
};

export type TabelPayload = Omit<Tabel, "id" | "active">;
