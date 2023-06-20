import { NextFunction, Request, Response } from "express";
import authCtrl from "@entity/auth/controller";
import requestCtrl from "@entity/request/controller";
import log from "@entity/log/controller";
import alwaysAllowedPath from "@/utils/alwaysAllowedPath";
import removePathVersion from "@/utils/removePathVersion";
import getHeaders from "@/utils/getHeaders";
import shopCtrl from "@/entity/shop/controller";
import { Id } from "@/core/interface";

const checkHaveAccessToShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const shopId = req.shopId;
  console.log("shopId:", shopId);
  if (shopId) {
    console.log("{ userId, shopId }:", { userId, shopId });
    const isOwner = await shopCtrl.isUserOwnerShop({ userId, shopId });
    if (isOwner) {
      next();
      return;
    }
  }
  // return res.status(401).json({ msg: `You'r not shop owner.` }); // not allowed
  authCtrl.logoutAndSendResponse(req, res, "You'r not shop owner.");
};

export default checkHaveAccessToShop;
