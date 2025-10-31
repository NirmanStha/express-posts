import { Request, Response, NextFunction } from "express";
import { UserService } from "../../services/user.service";
import { omit } from "../../helpers/omit";
import { userSchema } from "../../validation/userSchema";

import { CustomError } from "../../helpers/customError";
import { AuthRequest } from "../../request/authRequest";

export class UserController {
  static async getUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authUser = req.user;

      if (!authUser || !authUser.id) {
        throw new CustomError("User not found", 404);
      }
      const id = authUser.id;

      const user = await UserService.getCurrentUser(id);
      const safeUser = omit(user, ["password"]);
      if (!user) {
        return;
      }
      res.status(200).json({
        status: "success",
        data: safeUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id;
      const user = await UserService.getSpecificUser(id);
      if (!user) {
        throw new CustomError("User not found", 404);
      }
      const safeUser = omit(user, ["password"]);
      res.status(200).json({
        status: "success",
        data: safeUser,
      });
    } catch (error) {
      next(error);
    }
  }
  static async update(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = req.body;
      if (req.fileTypeError) {
        throw new CustomError("invalid file format", 400);
      }
      if (req.file) {
        data.profilePicture = req.file.filename;
      }

      const validatedData = userSchema.partial().parse(data);
      const updatedUser = await UserService.updateProfile(
        req.user,
        validatedData
      );
      res.status(200).json({
        status: "success",
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSpecificUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id;
      const user = await UserService.getSpecificUser(id);
      const safeUser = omit(user, ["password"]);
      res.status(200).json({
        status: "success",
        data: safeUser,
      });
    } catch (error) {
      next(error);
    }
  }
}
