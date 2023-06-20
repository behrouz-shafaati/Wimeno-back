import removePathVersion from "./removePathVersion";

const alwaysAllowedPath = async (requestPath: string): Promise<boolean> => {
  requestPath = removePathVersion(requestPath);
  const allowPass: string[] = [
    "/panel/auth",
    "/auth/shop-panel",
    "/auth",
    "/auth/register",
    "/auth/verify-email",
    "/auth/reset-password-request",
    "/auth/set-reseted-password",
    "/firebase-auth",
    "/auth/shop-panel/refresh",
    "/panel/auth/refresh",
    "/auth/refresh",
    "/auth/profile",
    "/panel/file/upload",
    "/logout",
    "/shops",
    "/shop",
    "/shops/search",
  ];
  for (let i = 0; i < allowPass.length; i++) {
    const path = allowPass[i];
    if (path === requestPath || path === requestPath) {
      return true;
    }
  }
  return false;
};

export default alwaysAllowedPath;
