const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

import c_controller from "@core/controller";
import authService from "./service";
import accessCtrl from "@entity/access/controller";
import requestCtrl from "@entity/request/controller";
import userCtrl from "@entity/user/controller";
import roleCtrl from "@entity/role/controller";
import authSchema from "./schema";
import { Request, Response } from "express";
import {
  Auth,
  DisablePreviuosDeviceAuth,
  RegisterPaylod,
  UpdateAccessToken,
  Logout,
  SetNewPasswordByEmailResetType,
} from "./interface";
import { HaveAccessPayload, User } from "@entity/user/interface";
import { Request as RequestEntity } from "@entity/request/interface";
import { Role } from "@entity/role/interface";
import getHeaders from "@/utils/getHeaders";
import { Id } from "@/core/interface";
import verifyCtrl from "../verify/controller";
import hash from "@/utils/hash";
import shopCtrl from "../shop/controller";

class controller extends c_controller {
  /**
   * constructor function for controller.
   *
   * @remarks
   * This method is part of the userController class extended of the main parent class baseController.
   *
   * @param service - userService
   *
   * @beta
   */
  constructor(service: any) {
    super(service);
  }
  async disablePreviuosDeviceAuth({
    userId,
    deviceUUID,
  }: DisablePreviuosDeviceAuth) {
    console.log("deactive this auth:", { userId, deviceUUID });
    await this.updateMany({
      filters: { userId, deviceUUID },
      params: { active: false },
    });
  }
  async saveNewAuth({
    userId,
    accessToken,
    refreshToken,
    deviceUUID,
    platform,
    origin,
    userAgent,
  }: Partial<Auth>) {
    const deviceid: string = deviceUUID as string;
    const id: Id = userId as Id;
    await this.disablePreviuosDeviceAuth({
      userId: id,
      deviceUUID: deviceid,
    });
    await this.create({
      params: {
        userId,
        accessToken,
        refreshToken,
        deviceUUID,
        platform,
        origin,
        userAgent,
      },
    });
  }

  async updateAccessToken({
    userId,
    deviceUUID,
    refreshToken,
    accessToken,
  }: UpdateAccessToken) {
    await this.findOneAndUpdate({
      filters: { userId, deviceUUID, refreshToken, active: true },
      params: { accessToken },
    });
  }

  async auth(req: any, res: Response) {
    const headers = getHeaders(req);
    const deviceUUID = req.deviceUUID;
    if (!deviceUUID)
      // return res.status(400).json({
      //   message: `deviceUUID is required. set in http header request ["Device-Uuid" = <uuid>]`,
      // });
      throw new Error(
        `deviceUUID is required. set in http header request ["Device-Uuid" = <uuid>]`
      );

    const { email, password } = req.body;
    if (!email || !password)
      // return res
      //   .status(400)
      //   .json({ message: "Username and password are required." });
      throw new Error("Username and password are required.");

    const foundUser: User = await userCtrl.findOne({ filters: { email } });
    if (!foundUser)
      // return res.sendStatus(401); //Unauthorized
      throw new Error("Don't exist user.");

    // evaluate password
    const match = await bcrypt.compare(password, foundUser.passwordHash);
    if (match) {
      if (!foundUser.emailVerified) {
        try {
          verifyCtrl.sendEmailVerifyCode(email);
          return { redirect: `/verify-email?email=${email}` };
          // return res.json({ redirect: `/verify-email?email=${email}` });
        } catch (error: any) {
          console.log(error?.message);
          // return res.status(400).json({ msg: "Unable to send verify email." });
          throw new Error("Unable to send verify email.");
        }
      }
      // create JWTs
      const accessToken = jwt.sign(
        { userId: foundUser.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { userId: foundUser.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "30d" }
      );
      // Saving refreshToken with current user
      const { platform, origin, userAgent } = headers;
      this.saveNewAuth({
        userId: foundUser.id,
        refreshToken,
        accessToken,
        deviceUUID,
        platform,
        origin,
        userAgent,
      });

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      const userWithAccesses = await userCtrl.getUserWithAccesses(foundUser.id);
      return { accessToken, user: userWithAccesses };
    } else {
      throw new Error("Wrong password.");
    }
  }

  async getUserProfileFromAccessToken(req: any, res: Response) {
    const userId = req.userId;
    const foundUser: User = await this.findOne({
      filters: userId,
      populate: "roleIds",
    });
    res.json(foundUser);
  }

  async refreshToken(req: any, res: Response) {
    const deviceUUID = req.deviceUUID;
    if (!deviceUUID)
      return res.status(400).json({
        message: `deviceUUID is required. set in http header request ["Device-Uuid" = <uuid>]`,
      });
    const cookies = req.cookies;
    if (!cookies?.jwt) return { status: 401, data: { msg: "Unauthurized." } };
    const refreshToken = cookies.jwt;
    console.log("filters find auth:", {
      refreshToken,
      deviceUUID,
      active: true,
    });
    const foundAuth: Auth = await this.findOne({
      filters: { refreshToken, deviceUUID, active: true },
    });
    if (!foundAuth) return { status: 403, data: { msg: "Forbidden #0." } }; //Forbidden
    const user = await userCtrl.findById({ id: foundAuth.userId });
    if (!user) return { status: 400, data: { msg: "Unvalid user." } };
    // evaluate jwt
    return jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err: any, decoded: any) => {
        if (err || user.id !== decoded.userId)
          return { status: 403, data: { msg: "Forbidden #1." } };
        const accessToken = jwt.sign(
          { userId: decoded.userId },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );
        if (refreshToken == "") {
          return { status: 401, data: { msg: "Your authentication expired." } };
        } else {
          this.updateAccessToken({
            userId: user.id,
            deviceUUID,
            refreshToken,
            accessToken,
          });
          const userWithAccesses = await userCtrl.getUserWithAccesses(user.id);
          return { status: 200, data: { accessToken, user: userWithAccesses } };
        }
      }
    );
  }

  async checkingPermissionToDoRequest(
    payload: HaveAccessPayload
  ): Promise<boolean> {
    payload = {
      userId: undefined,
      ...payload,
    };
    const { userId, method, path } = payload;

    let allowed = true;
    const request: RequestEntity = await requestCtrl.findOne({
      filters: { method, path },
    });
    if (!request || !request?.active) allowed = false;

    if (userId === undefined) {
      // user is guest
      const guestRole = await roleCtrl.getRoleBySlug("guest");
      const access = await accessCtrl.haveAccess({
        roleId: guestRole.id,
        requestId: request.id,
      });
      if (access && allowed) return true;
      return false;
    }

    const user: User = await userCtrl.findById({ id: userId });
    if (!user || !user.active) allowed = false;

    for (let i = 0; i < user.roles.length; i++) {
      const role: Role = user.roles[i] as Role;
      if (!role || !role.active) allowed = false;
      if (role.slug === "super_admin") return true;
      const access = await accessCtrl.haveAccess({
        roleId: role.id,
        requestId: request.id,
      });
      if (access && allowed) return true;
    }
    return false;
  }

  async register(payload: RegisterPaylod) {
    if (payload.password !== payload.confirmPassword)
      throw new Error(
        "The password and confirmation password must be the same"
      );
    const notVerifyedUser = userCtrl.isExistUnverifyedUserEmail(payload.email);
    if (notVerifyedUser) return notVerifyedUser;
    const defaultRole = await roleCtrl.getDefaultRole();
    const newUserPayload = {
      roles: [defaultRole.id],
      email: payload.email,
      passwordHash: payload.password,
    };
    try {
      return userCtrl.create({ params: newUserPayload });
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async logout({ userId, deviceUUID }: Logout) {
    try {
      await this.disablePreviuosDeviceAuth({ userId, deviceUUID });
    } catch (error) {
      throw error;
    }
  }

  async logoutAndSendResponse(
    req: any,
    res: any,
    message: string = "Log out done."
  ) {
    const userId = req.userId;
    const deviceUUID = req.deviceUUID;
    if (!deviceUUID) {
      res.status(204).json({ msg: "deviceUUID Rrequired." });
      return;
    }
    await this.logout({ userId, deviceUUID });
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.json({ msg: message });
  }

  async setNewPasswordByEmailReset({
    email,
    password,
    verifyCode,
  }: SetNewPasswordByEmailResetType) {
    const isValidCode = await verifyCtrl.isVerifyCodeValid({
      type: "EMAIL",
      code: verifyCode,
      origin: email,
    });
    if (!isValidCode) throw new Error("Unvalid verify code.");
    await userCtrl.findOneAndUpdate({
      filters: { email },
      params: { passwordHash: await hash(password), emailVerified: true },
    });
  }
}

export default new controller(new authService(authSchema));
