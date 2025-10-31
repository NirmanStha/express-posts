import { NextFunction } from "express";
import { User } from "../entities/user.entity";
import repo from "../config/repo";
import { CustomError } from "../helpers/customError";
import passwordHash from "password-hash";
import jwt from "jsonwebtoken";
import { plainToInstance } from "class-transformer";
import { UserDto } from "../dtos/user/user.dto";
import bcrypt from "bcrypt";
export class UserService {
  private static createAccessToken(user: User): string {
    return jwt.sign(
      { id: user.id, role: user.role, type: "access" },
      process.env.JWT_ACCESS_SECRET || "access_token",
      {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as any) || "1d",
      }
    );
  }

  private static createRefreshToken(user: User): string {
    return jwt.sign(
      { id: user.id, role: user.role, type: "refresh" },
      process.env.JWT_REFRESH_SECRET || "refresh_token",
      {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as any) || "7d",
      }
    );
  }

  private static async validatePassword(
    password: string | undefined,
    hash: string
  ): Promise<boolean> {
    if (!password) return false;
    return await bcrypt.compare(password, hash);
  }
  public static async refreshToken(token: string) {
    try {
      if (!token) {
        throw new CustomError("Refresh token is required", 400);
      }

      // Verify the refresh token with proper error handling
      let decoded: any;
      try {
        decoded = jwt.verify(
          token,
          process.env.JWT_REFRESH_SECRET || "refresh_token"
        );
      } catch (jwtError: any) {
        if (jwtError.name === "TokenExpiredError") {
          throw new CustomError("Refresh token has expired", 401);
        } else if (jwtError.name === "JsonWebTokenError") {
          throw new CustomError("Invalid refresh token", 401);
        } else {
          throw new CustomError("Token verification failed", 401);
        }
      }

      // Find user and verify they still exist
      const user = await repo.userRepo.findOne({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new CustomError("User not found", 404);
      }

      // Generate new tokens
      const accessToken = this.createAccessToken(user);
      const refreshToken = this.createRefreshToken(user);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      // Re-throw CustomErrors, wrap others
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to refresh token", 500);
    }
  }
  public static async register(
    data: Partial<User>,
    next: NextFunction
  ): Promise<Boolean | void> {
    if (!data.email) {
      throw new CustomError("Email is required", 400);
    }

    const existingUserEmail = await repo.userRepo.findOne({
      where: { email: data.email },
    });

    if (existingUserEmail) {
      return next(new CustomError("User already exists", 409)); // Return to stop execution
    }
    const existingUserUsername = await repo.userRepo.findOne({
      where: { username: data.username },
    });
    if (existingUserUsername) {
      return next(new CustomError("Username already exists", 409)); // Return to stop execution
    }

    if (!data.password) {
      throw new CustomError("Password is required", 400);
    }

    data.password = bcrypt.hashSync(data.password, 10);

    const user = repo.userRepo.create(data);
    await repo.userRepo.save(user);

    return true;
  }

  public static async loginAuth(
    data: Pick<User, "email" | "password">
  ): Promise<{
    user: UserDto;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await repo.userRepo.findOne({
      where: { email: data.email },
    });
    if (!user) {
      throw new CustomError("Invalid credentials", 401);
    }
    const isPasswordMatched = await this.validatePassword(
      data.password,
      user.password
    );
    if (!isPasswordMatched) {
      throw new CustomError("Invalid credentials", 401);
    }
    const accessToken = this.createAccessToken(user);
    const refreshToken = this.createRefreshToken(user);

    const userDto = plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
    const response = {
      user: userDto,
      accessToken,
      refreshToken,
    };
    return response;
  }

  public static async getCurrentUser(id: string): Promise<User> {
    console.log("this is id", id);
    const user = await repo.userRepo.findOne({
      where: { id: id },
      relations: ["posts"],
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }
    return user;
  }
  public static async getSpecificUser(id: string): Promise<User> {
    const user = await repo.userRepo.findOne({ where: { id: id } });
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    return user;
  }

  public static async updateProfile(
    user: User,
    data: Partial<User>
  ): Promise<any> {
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const updatedUser = Object.assign(user, data);

    await repo.userRepo.save(updatedUser);
    return updatedUser;
  }
}
