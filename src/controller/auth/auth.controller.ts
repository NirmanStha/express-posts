import { NextFunction, Request, Response } from "express";
import { userSchema } from "../../validation/userSchema";
import { UserService } from "../../services/user.service";
import { omit } from "../../helpers/omit";
import { ZodError } from "zod";
import { AuthRequest } from "../../request/authRequest";

export class AuthController {
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = req.body;

      if (req.file) {
        data.profilePicture = req.file.filename;
      }

      const validatedData = userSchema.parse(data);

      const user = await UserService.register(validatedData, next);

      res.status(201).json({
        status: "success",
        message: "User registered successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = req.body;
      const validatedData = userSchema
        .pick({ email: true, password: true })
        .parse(data);

      const authUser = await UserService.loginAuth(validatedData);
      const { accessToken, refreshToken, user } = authUser;
      if (!authUser) return;

      res.status(200).json({
        status: "success",
        message: "Login successful",
        data: user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.body.refreshToken;
      console.log(token);
      const newTokens = await UserService.refreshToken(token);
      res.status(200).json({
        status: "success",
        message: "token refreshed successfully",
        data: newTokens,
      });
    } catch (error) {
      next(error);
    }
  }
}
