import { Response, NextFunction } from "express";
import { verify, JwtPayload } from "jsonwebtoken";
import { CustomError } from "../helpers/customError";
import { AuthRequest } from "../request/authRequest";
import env from "../config/env";

export const authUser = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new CustomError("Access denied, no token provided", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    if (!decoded || !decoded.id) {
      return next(new CustomError("Invalid token payload", 401));
    }
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return next(new CustomError("Token expired", 401));
    }

    if (err.name === "JsonWebTokenError") {
      return next(new CustomError("Invalid token", 401));
    }

    next(err); // other unexpected error
  }
};
