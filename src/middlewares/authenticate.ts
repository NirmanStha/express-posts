import { Request, Response, NextFunction } from "express";
import repo from "../config/repo";
import { verify } from "jsonwebtoken";
import { User } from "../entities/user.entity";
import { CustomError } from "../helpers/customError";

export interface AuthRequest extends Request {
  user?: User;
}

export const authUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      res.status(401).json({
        status: "error",
        message: "Access denied, no token provided",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Use environment variable for JWT secret
    const decoded: any = verify(
      token,
      process.env.JWT_ACCESS_SECRET || "access_token"
    );
    const user = await repo.userRepo.findOne({ where: { id: decoded.id } });

    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    // Handle JWT specific errors
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        status: "error",
        message: "Token expired, please login again",
        expiredAt: error.expiredAt,
      });
      return;
    }

    if (error.name === "JsonWebTokenError") {
      res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
      return;
    }

    // For other errors, pass to error handler
    next(error);
  }
};
