import repo from "../config/repo";
import { CustomError } from "../helpers/customError";
import { omit } from "../helpers/omit";

export class CommentService {
  static async createComment(content: string, postId: string, userId: string) {
    const post = await repo.postRepo.findOne({ where: { id: postId } });
    const user = await repo.userRepo.findOne({ where: { id: userId } });
    if (!post || !user) {
      throw new Error("Post or User not found");
    }
    const comment = repo.comRepo.create({
      content,
      post,
      user,
    });
    await repo.comRepo.save(comment);
    const safeData = {
      ...comment,
      user: omit(comment.user, [
        "password",
        "email",
        "age",
        "createdAt",
        "updatedAt",
        "role",
      ]),
      post: omit(comment.post, ["user", "comments", "createdAt", "updatedAt"]),
    };
    return safeData;
  }
  static async getComment(postId: string) {}
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
      user: omit(commentWithUser.user, [
        "password",
        "email",
        "age",
        "createdAt",
        "updatedAt",
        "role",
      ]),
    };
    return safeData;
  }
  static async updateComment(id: string, content: string, userId: string) {
    const comment = await repo.comRepo.findOne({
      where: { id: id },
      relations: ["user"],
    });
    if (!comment) {
      throw new Error("Comment not found");
    }
    console.log(comment);
    if (comment.user.id !== userId) {
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
