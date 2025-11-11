import { NextFunction, Response } from "express";
import { AuthRequest } from "../../request/authRequest";
import { PostService } from "../../services/post.service";
import { CustomError } from "../../helpers/customError";
import { postSchema } from "../../validation/postSchema";

import { pick } from "../../helpers/pick";

export class PostController {
  // Create a post
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      if ((req as any).fileTypeError) {
        throw new CustomError("Invalid file format", 400);
      }

      if ((req as any).files) {
        data.filenames = (req as any).files.map((file: any) => file.filename);
      }

      const validatedData = postSchema.parse(data);
      const finalData = {
        ...validatedData,

        user: req.user,
      };
      const post = await PostService.createPost(finalData);
      const safePost = Array.isArray(post) ? post[0] : post;
      const safeData = {
        ...safePost,
        user: safePost.user
          ? pick(safePost.user, ["id", "firstName", "lastName"])
          : undefined,
      };
      res.status(201).json({
        status: "success",
        message: "Post created successfully",
        data: safeData,
      });
    } catch (error) {
      next(error);
    }
  }
  // Get a specific post
  static async getPost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const sortBy = (req.query.sortBy as string) || "createdAt";
      const sortOrder = (req.query.sortOrder as "ASC" | "DESC") || "DESC";
      const search = req.query.search as string;
      const post = await PostService.getUsersSpecificPost(id, {
        sortBy: sortBy as "createdAt" | "updatedAt" | "title",
        sortOrder,
        search,
      });

      res.status(200).json({
        status: "success",
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }
  // Update a post
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post_id = req.params.id;
      const owner_id = req.user!.id;
      const data = req.body;

      if ((req as any).fileTypeError) {
        throw new CustomError("Invalid file format", 400);
      }
      if ((req as any).files && (req as any).files.length > 0) {
        data.filenames = (req as any).files.map((file: any) => file.filename);
      }
      const validatedData = postSchema.partial().parse(data);

      const post = await PostService.editPost(post_id, validatedData, owner_id);
      res.status(200).json({
        status: "success",
        message: "Post updated successfully",
        data: post,
      });
    } catch (error) {
      next(error);
    }
  } //get all post
  static async getPosts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Extract pagination and filtering parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50); // Max 50 items per page
      const sortBy = (req.query.sortBy as string) || "createdAt";
      const sortOrder = (req.query.sortOrder as "ASC" | "DESC") || "DESC";
      const search = req.query.search as string;

      const result = await PostService.getAllPosts({
        page,
        limit,
        sortBy: sortBy as "createdAt" | "updatedAt" | "title",
        sortOrder,
        search,
      });

      res.status(200).json({
        status: "success",
        message: "Posts retrieved successfully",
        data: result,

        meta: {
          timestamp: new Date().toISOString(),
          version: "1.0",
          filters: {
            search: search || null,
            sortBy,
            sortOrder,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
