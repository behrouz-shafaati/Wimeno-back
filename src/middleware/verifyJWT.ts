import alwaysAllowedPath from "@/utils/alwaysAllowedPath";
import { NextFunction, Request, Response } from "express";

const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJWT = async (req: any, res: Response, next: NextFunction) => {
  const alwaysAllowed: boolean = await alwaysAllowedPath(req.path);
  const authHeader = req.headers["authorization"]; // authorization == accessToken

  if (!authHeader && !alwaysAllowed)
    return res.status(401).json({ msg: "Unauthorized" }); // Unahthorized
  if (!authHeader && alwaysAllowed) {
    next();
    return;
  } // Unahthorized
  const token = authHeader.split(" ")[1];
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err: any, decoded: any) => {
      if (err && !alwaysAllowed) return res.status(403).json("Unvalid JWT."); //invalid token
      if (!err) {
        req.userId = decoded.userId;
      }
      next();
    }
  );
};

export default verifyJWT;
