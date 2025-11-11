import { NextFunction, Request, Response } from "express";
import { userSchema } from "../../validation/userSchema";
import { UserService } from "../../services/user.service";
import { CustomError } from "../../helpers/customError";

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

      await UserService.register(validatedData);

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
      if (!authUser) {
        // Defensive: loginAuth currently throws on invalid credentials,
        // but check anyway to avoid runtime destructuring errors.
        throw new CustomError("Invalid credentials", 401);
      }
      const { accessToken, refreshToken, user } = authUser;

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
