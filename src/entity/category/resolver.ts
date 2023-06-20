import { Request, Response } from "express";
import requestCtrl from "@entity/request/controller";
import { RequestGroup, RequestPayload } from "@/entity/request/interface";
import categoryCtrl from "./controller";
import checkHaveAccessToShop from "@/middleware/checkHaveAccessToShop";
import getPaginationFiltersFromQuery from "@/utils/getPagenationFiltersFromQuery";
import { Id } from "@/core/interface";

module.exports = resolver;
const API_V = process.env.API_VERSION;
const entity = `category`;

function resolver(app: any) {
  // create category group request
  const categoryGroupRequestPaylod: RequestGroup = {
    parentSlug: null,
    description: "",
    slug: "category",
    title: "Category",
  };
  requestCtrl.create({ params: categoryGroupRequestPaylod });

  // resolve get categorys
  const getCategorysRequestPaylod: RequestPayload = {
    title: "List of all categorys",
    path: "/categorys",
    method: "GET",
    slug: "get_categorys",
    parentSlug: "category",
    dependencies: [],
  };
  requestCtrl.create({ params: getCategorysRequestPaylod });
  app.get(`/${API_V}/categorys`, async (req: Request, res: Response) => {
    try {
      const { filters, pagination } = getPaginationFiltersFromQuery(req.query);
      console.log("filters:", filters);
      const foundedCategorys = await categoryCtrl.find({ filters, pagination });
      console.log({ filters, pagination });
      res.json(foundedCategorys);
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: "Unable to get categorys." });
    }
  });

  // Resolve delete categorys
  const deleteCategoryPayload: RequestPayload = {
    title: "Delete categorys",
    path: `/panel/categorys`,
    method: "DELETE",
    slug: "delete_categorys",
    parentSlug: "category",
    dependencies: ["get_categorys"],
  };
  requestCtrl.create({ params: deleteCategoryPayload });
  app.delete(`/${API_V}/panel/categorys`, async (req: any, res: Response) => {
    if (!req.body?.ids && !req.body?.id)
      return res
        .status(400)
        .json({ msg: "Ids in delete is required.ids: <Array of ids>" });
    let filters: Id[];
    if (req.body?.id) filters = [req.body?.id];
    else filters = req.body?.ids;
    if (filters.length) categoryCtrl.delete({ filters });
    res.json({ msg: "Delete categorys(s) done." });
  });

  // resolve add category
  const createCategoryRequestPaylod: RequestPayload = {
    title: "Add category",
    path: "/panel/category",
    method: "POST",
    slug: "add_category",
    parentSlug: "category",
    dependencies: ["get_categorys"],
  };
  requestCtrl.create({ params: createCategoryRequestPaylod });
  app.post(`/${API_V}/panel/category`, async (req: any, res: Response) => {
    try {
      if (req.body.parentId == "null") req.body.parentId = null;
      await categoryCtrl.create({
        params: { ...req.body },
        saveLog: true,
      });
      res.json({ msg: "Category saved." });
    } catch (error: any) {
      res
        .status(400)
        .json({ msg: error.message || "Unable to save category." });
    }
  });

  // resolve update category
  const updateCategoryRequestPaylod: RequestPayload = {
    title: "Update category",
    path: "/panel/category",
    method: "PATCH",
    slug: "update_category",
    parentSlug: "category",
    dependencies: ["get_categorys"],
  };
  requestCtrl.create({ params: updateCategoryRequestPaylod });
  app.patch(`/${API_V}/panel/category`, async (req: any, res: Response) => {
    try {
      const categoryId = req.body.id;
      delete req.body.id;
      await categoryCtrl.findOneAndUpdate({
        filters: categoryId,
        params: { ...req.body },
      });
      res.json({ msg: "Category updated." });
    } catch (error: any) {
      res
        .status(400)
        .json({ msg: error.message || "Unable to update category." });
    }
  });
}
