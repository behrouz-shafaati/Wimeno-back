import { Request, Response } from "express";
import requestCtrl from "@entity/request/controller";
import { RequestGroup, RequestPayload } from "@/entity/request/interface";
import shopCtrl from "./controller";
import ResetPasswordLimiter from "@/middleware/ResetPasswordLimiter";
import { ShopPayload } from "./interface";
import userCtrl from "../user/controller";
import checkHaveAccessToShop from "@/middleware/checkHaveAccessToShop";
import getPaginationFiltersFromQuery from "@/utils/getPagenationFiltersFromQuery";

module.exports = resolver;
const API_V = process.env.API_VERSION;
const entity = `shop`;

function resolver(app: any) {
  // create shop group request
  const shopGroupRequestPaylod: RequestGroup = {
    parentSlug: null,
    description: "",
    slug: "shop",
    title: "Shop",
  };
  requestCtrl.create({ params: shopGroupRequestPaylod });

  // resolve get shops
  const getShopsRequestPaylod: RequestPayload = {
    title: "List of shops",
    path: "/shops",
    method: "GET",
    slug: "get_shops",
    parentSlug: "shop",
    dependencies: [],
  };
  requestCtrl.create({ params: getShopsRequestPaylod });
  app.get(`/${API_V}/shops`, async (req: Request, res: Response) => {
    try {
      const { filters, pagination } = getPaginationFiltersFromQuery(req.query);
      const foundedShops = await shopCtrl.find({ filters, pagination });
      console.log({ filters, pagination });
      res.json(foundedShops);
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: "Unable to get shops." });
    }
  });

  // resolve get shop
  const getShopRequestPaylod: RequestPayload = {
    title: "Shop with menu",
    path: "/shop",
    method: "GET",
    slug: "get_shop",
    parentSlug: "shop",
    dependencies: [],
  };
  requestCtrl.create({ params: getShopsRequestPaylod });
  app.get(`/${API_V}/shop`, async (req: Request, res: Response) => {
    try {
      const foundedShop = await shopCtrl.getShop(req.query);
      res.json(foundedShop);
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: "Unable to get shop." });
    }
  });

  // resolve seach shop, tabel
  // const requestSearchPaylod: RequestPayload = {
  //   title: "Seach shop, tabel & ...",
  //   path: "/shops/search",
  //   method: "GET",
  //   slug: "search_shop",
  //   parentSlug: "shop",
  //   dependencies: [],
  // };
  // requestCtrl.create({ params: requestSearchPaylod });
  app.get(`/${API_V}/shops/search`, async (req: Request, res: Response) => {
    try {
      const foundedShop = await shopCtrl.search(req.query);
      res.json(foundedShop);
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: "Unable to search." });
    }
  });

  // resolve register new shop by users
  const shopEmailRequestPaylod: RequestPayload = {
    title: "Register shop",
    path: "/shop/register",
    method: "POST",
    slug: "register_shop",
    parentSlug: "shop",
    dependencies: [],
  };
  requestCtrl.create({ params: shopEmailRequestPaylod });
  app.post(`/${API_V}/shop/register`, async (req: any, res: Response) => {
    try {
      console.log(req.body);
      await shopCtrl.create({ params: { ...req.body, userId: req.userId } });
      res.json({ msg: "Register shop done." });
    } catch (error: any) {
      res
        .status(400)
        .json({ msg: error.message || "Unable to register shop." });
    }
  });

  // resolve update shop by ouwner shop
  const updateShopRequestPaylod: RequestPayload = {
    title: "Update shop by owner",
    path: "/shop-panel",
    method: "PATCH",
    slug: "shop_panel_update",
    parentSlug: "shop",
    dependencies: [],
  };
  requestCtrl.create({ params: updateShopRequestPaylod });
  app.patch(
    `/${API_V}/shop-panel`,
    checkHaveAccessToShop,
    async (req: any, res: Response) => {
      try {
        const shopId = req.shopId;
        await shopCtrl.findOneAndUpdate({
          filters: shopId,
          params: { ...req.body },
        });
        res.json({ msg: "Shop information updated." });
      } catch (error: any) {
        res
          .status(400)
          .json({ msg: error.message || "Unable to update shop information." });
      }
    }
  );
}
