import { Request, Response } from "express";
import requestCtrl from "@entity/request/controller";
import { RequestGroup, RequestPayload } from "@/entity/request/interface";
import productCtrl from "./controller";
import checkHaveAccessToShop from "@/middleware/checkHaveAccessToShop";
import getPaginationFiltersFromQuery from "@/utils/getPagenationFiltersFromQuery";
import { Id } from "@/core/interface";

module.exports = resolver;
const API_V = process.env.API_VERSION;
const entity = `product`;

function resolver(app: any) {
  // create product group request
  const productGroupRequestPaylod: RequestGroup = {
    parentSlug: null,
    description: "",
    slug: "product",
    title: "Product",
  };
  requestCtrl.create({ params: productGroupRequestPaylod });

  // resolve get products
  const getProductsRequestPaylod: RequestPayload = {
    title: "List of all products",
    path: "/shop-panel/products",
    method: "GET",
    slug: "get_products_shop_panel",
    parentSlug: "product",
    dependencies: [],
  };
  requestCtrl.create({ params: getProductsRequestPaylod });
  app.get(
    `/${API_V}/shop-panel/products`,
    async (req: Request, res: Response) => {
      try {
        const { filters, pagination } = getPaginationFiltersFromQuery(
          req.query
        );
        const foundedProducts = await productCtrl.find({ filters, pagination });
        console.log({ filters, pagination });
        res.json(foundedProducts);
      } catch (error) {
        console.log(error);
        res.status(400).json({ msg: "Unable to get products." });
      }
    }
  );

  // Resolve delete products
  const deleteProductPayload: RequestPayload = {
    title: "Delete products",
    path: `/shop-panel/products`,
    method: "DELETE",
    slug: "delete_products_shop_panel",
    parentSlug: "product",
    dependencies: ["get_products"],
  };
  requestCtrl.create({ params: deleteProductPayload });
  app.delete(
    `/${API_V}/shop-panel/products`,
    checkHaveAccessToShop,
    async (req: any, res: Response) => {
      if (!req.body?.ids && !req.body?.id)
        return res
          .status(400)
          .json({ msg: "Ids in delete is required.ids: <Array of ids>" });
      let filters: Id[];
      if (req.body?.id) filters = [req.body?.id];
      else filters = req.body?.ids;
      if (filters.length) productCtrl.delete({ filters });
      res.json({ msg: "Delete products(s) done." });
    }
  );

  // resolve add product
  const createProductRequestPaylod: RequestPayload = {
    title: "Add product",
    path: "/shop-panel/product",
    method: "POST",
    slug: "add_product_shop_panel",
    parentSlug: "product",
    dependencies: ["get_products"],
  };
  requestCtrl.create({ params: createProductRequestPaylod });
  app.post(
    `/${API_V}/shop-panel/product`,
    checkHaveAccessToShop,
    async (req: any, res: Response) => {
      try {
        const shopId = req.shopId;
        await productCtrl.create({
          params: { ...req.body, userId: req.userId, shopId },
          saveLog: true,
        });
        res.json({ msg: "Product saved." });
      } catch (error: any) {
        res
          .status(400)
          .json({ msg: error.message || "Unable to save product." });
      }
    }
  );

  // resolve update product
  const updateProductRequestPaylod: RequestPayload = {
    title: "Update product",
    path: "/shop-panel/product",
    method: "PATCH",
    slug: "update_product_shop_panel",
    parentSlug: "product",
    dependencies: ["get_products"],
  };
  requestCtrl.create({ params: updateProductRequestPaylod });
  app.patch(
    `/${API_V}/shop-panel/product`,
    checkHaveAccessToShop,
    async (req: any, res: Response) => {
      try {
        const productId = req.body.productId;
        delete req.body.productId;
        await productCtrl.findOneAndUpdate({
          filters: productId,
          params: { ...req.body },
        });
        res.json({ msg: "Product updated." });
      } catch (error: any) {
        res
          .status(400)
          .json({ msg: error.message || "Unable to update product." });
      }
    }
  );
}
