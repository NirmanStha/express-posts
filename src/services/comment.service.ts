import { plainToInstance } from "class-transformer";
import repo from "../config/repo";
import { User } from "../entities/user.entity";
import { CustomError } from "../helpers/customError";
import { omit } from "../helpers/omit";
import { CreateCommentDto } from "../dtos/comment/comment.dto";

export class CommentService {
  static async createComment(content: string, postId: string, userId: string) {
    const post = await repo.postRepo.findOne({ where: { id: postId } });
    const user = await repo.userRepo.findOne({ where: { id: userId } });
    if (!post || !user) {
      throw new Error("Invalid request, post or user not found");
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

    const CommentDto = plainToInstance(CreateCommentDto, data, {
      excludeExtraneousValues: true,
    });
    return CommentDto;
  }

  static async getSingleComment(com_id: string) {
    const commentWithUser = await repo.comRepo.findOne({
      where: { id: com_id },
      relations: ["user"],
    });
    if (!commentWithUser) {
      throw new Error("Comment not found");
    }

    const safeData = {
      ...commentWithUser,
      author: commentWithUser.user,
    };
    const commentDto = plainToInstance(CreateCommentDto, safeData, {
      excludeExtraneousValues: true,
    });
    return commentDto;
  }
  static async updateComment(id: string, content: string, user: User) {
    const comment = await repo.comRepo.findOne({
      where: { id: id },
      relations: ["user"],
    });
    if (!comment) {
      throw new Error("Comment not found");
    }
    console.log(comment);
    if (comment.user.id !== user.id) {
      throw new CustomError(
        "You are not authorized to update this comment",
        403
      );
    }
    await repo.comRepo.update(id, { content });
    const updatedComment = await repo.comRepo.findOne({ where: { id: id } });
    return updatedComment;
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
