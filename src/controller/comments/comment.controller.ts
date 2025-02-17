import { CustomError } from "../../helpers/customError";
import { AuthRequest } from "../../middlewares/authenticate";
import { CommentService } from "../../services/comment.service";
import { Request, Response, NextFunction } from "express";

export class CommentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { content } = req.body;
      const { postId } = req.params;
      const { user } = req as AuthRequest;
      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const comment = await CommentService.createComment(
        content,
        postId,
        user.id
      );
      res.status(200).json({
        status: "successfull",
        message: "Comment created successfully",
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;

      // const comments = await CommentService.getComments(postId);
      // res.status(200).json({ comments });
    } catch (error) {
      next(error);
    }
  }
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const body = req as AuthRequest;
      const user = body.user;
      if (!user) {
        throw new CustomError("Unauthorized", 401);
      }
      console.log("conternt", content);
      const comment = await CommentService.updateComment(id, content, user.id);

      res.status(200).json({
        status: "success",
        message: "Comment updated successfully",
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = req as AuthRequest;
      const user = body.user;
      if (!user) {
        throw new CustomError("Unauthorized", 401);
      }
      const comment = await CommentService.deleteComment(id, user.id);
      res.status(200).json({ status: "success", message: "Comment deleted" });
    } catch (error) {
      next(error);
    }
  }
  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.params, "this is params");
      const { id } = req.params;
      const comment = await CommentService.getSingleComment(id);
      res.status(200).json({ satus: "success", data: comment });
    } catch (error) {
      next(error);
    }
  }
}
