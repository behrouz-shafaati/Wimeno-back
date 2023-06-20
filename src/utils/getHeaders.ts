import { Request } from "express";

export default function getHeaders(req: Request) {
  const origin = req.get("Origin");
  const app = req.get("Sec-Ch-Ua");
  const platform = req.get("Sec-Ch-Ua-Platform");
  const userAgent = req.get("User-Agent");
  const deviceUUID = req.get("Device-Uuid") || null;
  const shopId = req.get("Shop-Id") || null;
  return { origin, app, platform, userAgent, deviceUUID, shopId };
}
