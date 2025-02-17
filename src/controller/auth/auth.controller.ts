import { NextFunction, Request, Response } from "express";
import { userSchema } from "../../validation/userSchema";
import { UserService } from "../../services/user.service";
import { omit } from "../../helpers/omit";
import { ZodError } from "zod";

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

      if (!user) return;

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

      const tokens = await UserService.loginAuth(validatedData);
      if (tokens) {
        const { accessToken, refreshToken, user } = tokens;
        const safeUser = omit(user, ["password"]);
        res.status(200).json({
          status: "success",
          message: "User logged in successfully",
          data: { accessToken, refreshToken, safeUser },
        });
      } else {
        res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
      }
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
        message: "token refreshed",
        data: newTokens,
      });
    } catch (error) {
      next(error);
    }
  }
}
