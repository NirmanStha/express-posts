import { CustomError } from "../../helpers/customError";
import { AuthRequest } from "../../request/authRequest";

import { CommentService } from "../../services/comment.service";
import { Request, Response, NextFunction } from "express";

export class CommentController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { content } = req.body;
      const { postId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new CustomError("Unauthorized", 401);
      }

      const comment = await CommentService.createComment(
        content,
        postId,
        userId
      );

      res.status(201).json({
        status: "success",
        message: "Comment created successfully",
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new CustomError("Unauthorized", 401);
      }

      const comment = await CommentService.updateComment(id, content, userId);

      res.status(200).json({
        status: "success",
        message: "Comment updated successfully",
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }
  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user) {
        throw new CustomError("Unauthorized", 401);
      }

      await CommentService.deleteComment(id, user.id);
      res.status(200).json({ status: "success", message: "Comment deleted" });
    } catch (error) {
      next(error);
    }
  }
  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const comment = await CommentService.getSingleComment(id);
      res.status(200).json({ status: "success", data: comment });
    } catch (error) {
      next(error);
    }
  }
}
