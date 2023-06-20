import { Request, Response } from "express";
import requestCtrl from "@entity/request/controller";
import { RequestGroup, RequestPayload } from "@/entity/request/interface";
import tabelCtrl from "./controller";
import checkHaveAccessToShop from "@/middleware/checkHaveAccessToShop";
import getPaginationFiltersFromQuery from "@/utils/getPagenationFiltersFromQuery";
import { Id } from "@/core/interface";

module.exports = resolver;
const API_V = process.env.API_VERSION;
const entity = `tabel`;

function resolver(app: any) {
  // create tabel group request
  const tabelGroupRequestPaylod: RequestGroup = {
    parentSlug: null,
    description: "",
    slug: "tabel",
    title: "Tabel",
  };
  requestCtrl.create({ params: tabelGroupRequestPaylod });

  // resolve get tabels
  const getTabelsRequestPaylod: RequestPayload = {
    title: "List of all tabels",
    path: "/shop-panel/tabels",
    method: "GET",
    slug: "get_tabels_shop_panel",
    parentSlug: "tabel",
    dependencies: [],
  };
  requestCtrl.create({ params: getTabelsRequestPaylod });
  app.get(
    `/${API_V}/shop-panel/tabels`,
    async (req: Request, res: Response) => {
      try {
        const { filters, pagination } = getPaginationFiltersFromQuery(
          req.query
        );
        const foundedTabels = await tabelCtrl.find({ filters, pagination });
        console.log({ filters, pagination });
        res.json(foundedTabels);
      } catch (error) {
        console.log(error);
        res.status(400).json({ msg: "Unable to get tabels." });
      }
    }
  );

  // Resolve delete tabels
  // const deleteTabelPayload: RequestPayload = {
  //   title: "Delete tabels",
  //   path: `/shop-panel/tabels`,
  //   method: "DELETE",
  //   slug: "delete_tabels_shop_panel",
  //   parentSlug: "tabel",
  //   dependencies: ["get_tabels"],
  // };
  // requestCtrl.create({ params: deleteTabelPayload });
  // app.delete(
  //   `/${API_V}/shop-panel/tabels`,
  //   checkHaveAccessToShop,
  //   async (req: any, res: Response) => {
  //     if (!req.body?.ids && !req.body?.id)
  //       return res
  //         .status(400)
  //         .json({ msg: "Ids in delete is required.ids: <Array of ids>" });
  //     let filters: Id[];
  //     if (req.body?.id) filters = [req.body?.id];
  //     else filters = req.body?.ids;
  //     if (filters.length) tabelCtrl.delete({ filters });
  //     res.json({ msg: "Delete tabels(s) done." });
  //   }
  // );

  // resolve add tabel
  const createTabelRequestPaylod: RequestPayload = {
    title: "Add tabel",
    path: "/shop-panel/tabel",
    method: "POST",
    slug: "add_tabel_shop_panel",
    parentSlug: "tabel",
    dependencies: ["get_tabels"],
  };
  requestCtrl.create({ params: createTabelRequestPaylod });
  app.post(
    `/${API_V}/shop-panel/tabel`,
    checkHaveAccessToShop,
    async (req: any, res: Response) => {
      try {
        const shopId = req.shopId;
        await tabelCtrl.create({
          params: { ...req.body, shopId },
          saveLog: true,
        });
        res.json({ msg: "Tabel saved." });
      } catch (error: any) {
        res.status(400).json({ msg: error.message || "Unable to save tabel." });
      }
    }
  );

  // resolve update tabel
  // const updateTabelRequestPaylod: RequestPayload = {
  //   title: "Update tabel",
  //   path: "/shop-panel/tabel",
  //   method: "PATCH",
  //   slug: "update_tabel_shop_panel",
  //   parentSlug: "tabel",
  //   dependencies: ["get_tabels"],
  // };
  // requestCtrl.create({ params: updateTabelRequestPaylod });
  // app.patch(
  //   `/${API_V}/shop-panel/tabel`,
  //   checkHaveAccessToShop,
  //   async (req: any, res: Response) => {
  //     try {
  //       const tabelId = req.body.tabelId;
  //       delete req.body.tabelId;
  //       await tabelCtrl.findOneAndUpdate({
  //         filters: tabelId,
  //         params: { ...req.body },
  //       });
  //       res.json({ msg: "Tabel updated." });
  //     } catch (error: any) {
  //       res
  //         .status(400)
  //         .json({ msg: error.message || "Unable to update tabel." });
  //     }
  //   }
  // );
}
