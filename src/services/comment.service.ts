import { plainToInstance } from "class-transformer";
import repo from "../config/repo";
import { CustomError } from "../helpers/customError";
import { CreateCommentDto } from "../dtos/comment/comment.dto";

export class CommentService {
  static async createComment(content: string, postId: string, userId: string) {
    const post = await repo.postRepo.findOne({ where: { id: postId } });
    const user = await repo.userRepo.findOne({ where: { id: userId } });
    if (!post || !user) {
      throw new CustomError("Invalid request, post or user not found", 404);
    }
    const comment = repo.comRepo.create({
      content,
      post,
      user,
    });
    await repo.comRepo.save(comment);

    const data = {
      ...comment,
      author: comment.user,
      post: post,
    };

    return plainToInstance(CreateCommentDto, data, {
      excludeExtraneousValues: true,
    });
  }

  static async getSingleComment(com_id: string) {
    const commentWithUser = await repo.comRepo.findOne({
      where: { id: com_id },
      relations: ["user"],
    });
    if (!commentWithUser) {
      throw new CustomError("Comment not found", 404);
    }

    const safeData = {
      ...commentWithUser,
      author: commentWithUser.user,
    };

    return plainToInstance(CreateCommentDto, safeData, {
      excludeExtraneousValues: true,
    });
  }
  static async updateComment(id: string, content: string, userId: string) {
    const comment = await repo.comRepo.findOne({
      where: { id: id },
      relations: ["user", "post"],
    });
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }

    if (comment.user.id !== userId) {
      throw new CustomError(
        "You are not authorized to update this comment",
        403
      );
    }

    comment.content = content;
    const updatedComment = await repo.comRepo.save(comment);

    const safeData = {
      ...updatedComment,
      author: updatedComment.user,
    };

    return plainToInstance(CreateCommentDto, safeData, {
      excludeExtraneousValues: true,
    });
  }
  static async deleteComment(id: string, userId: string) {
    const comment = await repo.comRepo.findOne({
      where: { id: id },
      relations: ["user"],
    });
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }
    if (comment.user.id !== userId) {
      throw new CustomError(
        "You are not authorized to delete this comment",
        403
      );
    }

    await repo.comRepo.delete(id);
    return true;
  }
}
