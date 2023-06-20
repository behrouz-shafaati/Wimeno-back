import { NextFunction, Request, Response } from "express";
import getHeaders from "@/utils/getHeaders";

const initMiddleware = async (req: any, res: Response, next: NextFunction) => {
  const headers = getHeaders(req);
  const { shopId, deviceUUID } = headers;
  req.deviceUUID = deviceUUID;
  req.shopId = shopId || null;
  next();
  return;
};

export default initMiddleware;
