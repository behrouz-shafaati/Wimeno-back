import { Create, Id, QueryFind } from "@/core/interface";
import baseController from "@core/controller";
import productCtrl from "../product/controller";
import tabelCtrl from "../tabel/controller";
import { InitShopLoginPanel, IsUserOwnerShopType } from "./interface";
import shopSchema from "./schema";
import shopService from "./service";

class controller extends baseController {
  /**
   * constructor function for controller.
   *
   * @remarks
   * This method is part of the shopController class extended of the main parent class baseController.
   *
   * @param service - shopService
   *shopCtrl
   * @beta
   */
  constructor(service: any) {
    super(service);
  }

  standardizationFilters(filters: any): any {
    if (typeof filters != "object") return {};
    for (const [key, value] of Object.entries(filters)) {
      if (typeof value != "string") continue;

      // for string values
      if (key == "title") filters[key] = { $regex: new RegExp(value, "i") };

      // for search query
      if (key == "query") {
        filters.$expr = {
          $regexMatch: {
            input: {
              $concat: ["$title", "$shopStringId"],
            },
            regex: filters.query,
            options: "i",
          },
        };
        delete filters.query;
      }

      if (key == "orderBy" && value == "title") {
        filters.orderBy = "title";
      }

      // for id
      if (key == "id") {
        filters._id = value;
        delete filters.id;
      }
    }
    return filters;
  }

  async isExistShopId(shopStringId: string) {
    const shopFound = await this.findOne({ filters: { shopStringId } });
    if (shopFound) return true;
    return false;
  }

  async create({ params, saveLog }: Create): Promise<any> {
    const countShops = await this.countUsersShops(params.userId);
    if (countShops > 0) throw new Error("You have a shop before.");
    const shopStringId = params?.shopStringId;
    if (!shopStringId) throw new Error("Shop ID is required.");
    const isExistShopId = await this.isExistShopId(shopStringId);
    if (isExistShopId) throw new Error("Shop ID is duplicate");
    return super.create({ params, saveLog: true });
  }

  async isUserOwnerShop({ userId, shopId }: IsUserOwnerShopType) {
    const shopFound = await this.findOne({
      filters: { id: shopId, userId: userId },
    });
    if (shopFound) return true;
    return false;
  }

  async initShopLoginPanel({ userId, shopId }: InitShopLoginPanel) {
    const listUserShops = await this.listOfUserShops(userId);
    console.log("listUserShops:", listUserShops);
    const _shopId = shopId as Id;
    let shop = null;
    if (_shopId) {
      const isOwnerShop = this.isUserOwnerShop({ userId, shopId: _shopId });
      if (!isOwnerShop) return { listShops: listUserShops, shop: null };

      shop = await this.findById({ id: shopId });
      if (!shop) return { listShops: listUserShops, shop: null };
    } else {
      if (listUserShops.length > 0) {
        shop = listUserShops[0];
      }
    }
    return { listShops: listUserShops, shop };
  }

  async listOfUserShops(userId: Id) {
    const listUserShops = await this.findAll({ filters: { userId } });
    return listUserShops.data;
  }

  async countUsersShops(userId: Id) {
    const listUserShops = await this.findAll({ filters: { userId } });
    return listUserShops.data.length;
  }

  async find(payload: QueryFind): Promise<any> {
    const filters = this.standardizationFilters(payload.filters);
    return super.find({ ...payload, filters });
  }

  async getShop(payload: QueryFind): Promise<any> {
    const filters = this.standardizationFilters(payload.filters);
    const result = await super.find({ filters: { ...payload } });
    const _data = [];
    for (let i = 0; i < result.data.length; i += 1) {
      const shop = result.data[i];
      const products = await this.getShopWithMenu(result.data[i].id);
      result.data[i] = { ...shop.toObject(), products: products.data };
    }
    return result;
  }

  async search({ query }: { query: any }): Promise<any> {
    // const filters = this.standardizationFilters({ query });
    // const shopFounded = await super.find({ filters });

    let tabelFounded;
    // if (typeof query == "number")
    tabelFounded = await tabelCtrl.find({ filters: { code: Number(query) } });
    // return { ...shopFounded?.data, ...tabelFounded?.data };
    return tabelFounded?.data || [];
  }

  async getShopWithMenu(shopId: Id) {
    const shopProducts = await productCtrl.findAll({ filters: { shopId } });
    return shopProducts;
  }
}

const shopCtrl = new controller(new shopService(shopSchema));
export default shopCtrl;
