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
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      throw new Error("Access denied, no token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = verify(token, "access_token");
    const user = await repo.userRepo.findOne({ where: { id: decoded.id } });

    if (!user) {
      throw new CustomError("User not found ", 404);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
