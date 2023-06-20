import { Request, Response } from "express";
import { RequestGroup, RequestPayload } from "@entity/request/interface";
import requestCtrl from "@entity/request/controller";
import authCtrl from "./controller";
import loginLimiter from "@/middleware/loginLimiter";
import userCtrl from "@/entity/user/controller";
import getHeaders from "@/utils/getHeaders";
import decodeFirebaseIdToken from "@/firebase";
import shopCtrl from "../shop/controller";
import checkHaveAccessToShop from "@/middleware/checkHaveAccessToShop";

module.exports = resolver;
const API_V = process.env.API_VERSION;

function resolver(app: any) {
  // create authentication group request
  const accessGroupRequestPaylod: RequestGroup = {
    parentSlug: null,
    description: "",
    slug: "authentication",
    title: "Authentication",
  };
  requestCtrl.create({ params: accessGroupRequestPaylod });

  // always allowed path
  // resolve Authentication
  const authRequestPaylod: RequestPayload = {
    title: "Panel Authentication",
    path: "/panel/auth",
    parentSlug: "authentication",
    method: "POST",
    slug: "auth_panel",
    dependencies: [],
  };
  requestCtrl.create({ params: authRequestPaylod });

  app.post(
    `/${API_V}/panel/auth`,
    loginLimiter,
    async (req: Request, res: Response) => {
      try {
        const auth = await authCtrl.auth(req, res);
        res.json(auth);
      } catch (error: any) {
        res.status(401).json({ msg: error.message });
      }
    }
  );

  // always allowed path
  // resolve Authentication shop panel
  const authShopPanelRequestPaylod: RequestPayload = {
    title: "Panel Authentication",
    path: "/auth/shop-panel",
    parentSlug: "authentication",
    method: "POST",
    slug: "auth_shop_panel",
    dependencies: [],
  };
  // requestCtrl.create({ params: authRequestPaylod });

  app.post(
    `/${API_V}/auth/shop-panel`,
    loginLimiter,
    async (req: any, res: Response) => {
      try {
        const auth: any = await authCtrl.auth(req, res);
        const shopResult = await shopCtrl.initShopLoginPanel({
          userId: auth.user.id,
          shopId: req.shopId,
        });
        res.json({ ...auth, ...shopResult });
      } catch (error: any) {
        res.status(500).json({ msg: error.message });
      }
    }
  );

  // always allowed path
  // resolve Authentication
  const appAuthRequestPaylod: RequestPayload = {
    title: "App Authentication",
    path: "/auth",
    parentSlug: "authentication",
    method: "POST",
    slug: "auth",
    dependencies: [],
  };
  requestCtrl.create({ params: appAuthRequestPaylod });

  app.post(
    `/${API_V}/auth`,
    loginLimiter,
    async (req: Request, res: Response) => {
      try {
        const auth = await authCtrl.auth(req, res);
        res.json(auth);
      } catch (error: any) {
        res.status(401).json({ msg: error.message });
      }
    }
  );

  // always allowed path
  // resolve firebase Authentication
  const appFirebaseAuthRequestPaylod: RequestPayload = {
    title: "App Authentication",
    path: "/firebase-auth",
    parentSlug: "authentication",
    method: "POST",
    slug: "auth",
    dependencies: [],
  };
  requestCtrl.create({ params: appFirebaseAuthRequestPaylod });

  app.post(
    `/${API_V}/firebase-auth`,
    loginLimiter,
    async (req: Request, res: Response) => {
      try {
        console.log(req.body.idTokens);
        const dec = await decodeFirebaseIdToken(req.body.idTokens);
        console.log("dec:", dec);
      } catch (error: any) {
        // res.status(500).json({ msg: error.message });
        console.log(error.message);
        res.status(500).json({ msg: "Unable in login." });
      }
    }
  );

  // resolve refreshAccessToken
  // always allowed path
  const refreshRequestPaylod: RequestPayload = {
    path: "/panel/auth/refresh",
    parentSlug: "authentication",
    method: "GET",
    slug: "auth_refresh",
    title: "Panel Refresh Tocken",
    dependencies: ["auth_panel"],
  };
  requestCtrl.create({ params: refreshRequestPaylod });

  app.get(
    `/${API_V}/panel/auth/refresh`,
    async (req: Request, res: Response) => {
      try {
        const refresh = await authCtrl.refreshToken(req, res);
        res.status(refresh.status).json(refresh.data);
      } catch (error: any) {
        res.status(500).json({ msg: error.message });
      }
    }
  );

  // resolve refreshAccessToken for app
  // always allowed path
  const appRefreshRequestPaylod: RequestPayload = {
    title: "App Refresh Tocken",
    path: "/auth/refresh",
    parentSlug: "authentication",
    method: "GET",
    slug: "auth",
    dependencies: ["auth"],
  };
  requestCtrl.create({ params: refreshRequestPaylod });

  app.get(`/${API_V}/auth/refresh`, async (req: Request, res: Response) => {
    try {
      const refresh = await authCtrl.refreshToken(req, res);
      res.status(refresh.status).json(refresh.data);
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  });

  // resolve refreshAccessToken for shop panel
  // always allowed path
  // const appRefreshRequestPaylod: RequestPayload = {
  //   title: "App Refresh Tocken",
  //   path: "/auth/refresh",
  //   parentSlug: "authentication",
  //   method: "GET",
  //   slug: "auth",
  //   dependencies: ["auth"],
  // };
  // requestCtrl.create({ params: refreshRequestPaylod });

  app.get(
    `/${API_V}/auth/shop-panel/refresh`,
    async (req: any, res: Response) => {
      try {
        let shop = {};
        const refresh = await authCtrl.refreshToken(req, res);
        if (refresh.status == 200) {
          const isOwner = await shopCtrl.isUserOwnerShop({
            userId: refresh.data.user.id,
            shopId: req.shopId,
          });
          if (isOwner) {
            const foundShop = await shopCtrl.findById({ id: req.shopId });
            shop = { shop: foundShop };
          }
        }
        res.status(refresh.status).json({ ...refresh.data, ...shop });
      } catch (error: any) {
        res.status(500).json({ msg: error.message });
      }
    }
  );

  // resolve /user/profile - get user info by aaccessToken
  // always allowed path
  const getPropfileRequestPaylod: RequestPayload = {
    description: "Get user profile info by himself",
    path: "/auth/profile",
    parentSlug: "authentication",
    method: "GET",
    slug: "auth_profile",
    title: "Get profile",
    dependencies: [],
  };
  requestCtrl.create({ params: getPropfileRequestPaylod });

  app.get(`/${API_V}/auth/profile`, (req: Request, res: Response) => {
    authCtrl.getUserProfileFromAccessToken(req, res);
  });

  // resolve /auth/register - register user
  // always allowed path
  const registerRequestPaylod: RequestPayload = {
    description: "Create user acount by people",
    path: "/auth/register",
    parentSlug: "authentication",
    method: "POST",
    slug: "auth_register",
    title: "Register",
    dependencies: [],
  };
  requestCtrl.create({ params: registerRequestPaylod });

  app.post(`/${API_V}/auth/register`, async (req: Request, res: Response) => {
    try {
      console.log(req.body);
      await authCtrl.register(req.body);
      const auth = await authCtrl.auth(req, res);
      res.json(auth);
    } catch (error: any) {
      console.log("have error");
      res.status(400).json({ msg: error.message });
    }
  });

  // resolve /auth/set-reset-password
  // always allowed path
  app.post(
    `/${API_V}/auth/set-reseted-password`,
    async (req: Request, res: Response) => {
      try {
        await authCtrl.setNewPasswordByEmailReset(req.body);
        const auth = await authCtrl.auth(req, res);
        res.json(auth);
      } catch (error: any) {
        res.status(400).json({ msg: error.message });
      }
    }
  );
  // resolve /logout - register user
  // always allowed path
  const logoutRequestPaylod: RequestPayload = {
    description: "Logout",
    path: "/logout",
    parentSlug: "authentication",
    method: "POST",
    slug: "logout",
    title: "Logout",
    dependencies: [],
  };
  requestCtrl.create({ params: registerRequestPaylod });

  app.post(`/${API_V}/logout`, async (req: any, res: Response) => {
    try {
      authCtrl.logoutAndSendResponse(req, res);
    } catch (error: any) {
      console.log("have error");
      res.status(400).json({ msg: error.message });
    }
  });
}
