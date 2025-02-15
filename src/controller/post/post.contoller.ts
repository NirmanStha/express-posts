import { NextFunction, Response } from "express";

import { PostService } from "../../services/post.service";
import { CustomError } from "../../helpers/customError";
import { postSchema } from "../../validation/postSchema";
import { omit } from "../../helpers/omit";

export class PostController {
  // Create a post
  static async create(req: any, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      console.log("this is controller", data);
      if (req.fileTypeError) {
        throw new CustomError("Invalid file format", 400);
      }

      if (req.files) {
        data.filenames = req.files.map((file: any) => file.filename);
      }

      const validatedData = postSchema.parse(data);
      const finalData = {
        ...validatedData,

        user: req.user,
      };
      const post = await PostService.createPost(finalData);
      const safeData = {
        ...post,
        user: omit(post.user, ["password", "role"]),
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
  static async getPost(req: any, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      const post = await PostService.getUsersSpeciticPost(id);

      res.status(200).json({
        status: "success",
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }
  // Update a post
  static async update(req: any, res: Response, next: NextFunction) {
    try {
      const post_id = req.params.id;

      const data = req.body;
      console.log(data, "this is data");
      if (req.fileTypeError) {
        throw new CustomError("Invalid file format", 400);
      }
      if (req.files) {
        data.filenames = req.files.map((file: any) => file.filename);
      }
      const validatedData = postSchema.partial().parse(data);
      const post = await PostService.editPost(post_id, validatedData);
      res.status(200).json({
        status: "success",
        message: "Post updated successfully",
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }
}
