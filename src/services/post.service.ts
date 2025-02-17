import { DataSource } from "typeorm";
import repo from "../config/repo";
import { Post } from "../entities/post.entity";
import { AppDataSource } from "../config/dataSource";
import { CustomError } from "../helpers/customError";

export class PostService {
  static async createPost(
    data: Omit<Post, "id" | "createdAt" | "updatedAt" | "comments">
  ) {
    const post = repo.postRepo.create(data);

    await repo.postRepo.save(post);
    return post;
  }

  static async getUsersSpeciticPost(id: string) {
    const uid = parseInt(id);
    const post = await AppDataSource.getRepository(Post)
      .createQueryBuilder("post")
      .where("post.id like :id", { id: uid })
      .leftJoin("post.user", "user")
      .select([
        "post.id",
        "post.title",
        "post.content",
        "post.filenames",
        "post.createdAt",
        "post.updatedAt",
        "user.id",
        "user.email",
        "user.firstName",
        "user.lastName",
      ])
      .getOne();
    if (!post) {
      throw new CustomError("Post not found", 404);
    }
    return post;
  }

  static async editPost(id: string, data: Partial<Post>) {
    const post = await repo.postRepo.findOne({ where: { id: id } });
    if (!post) {
      throw new CustomError("Post not found", 404);
    }

    await repo.postRepo.update(id, data);
    const updatedPost = await repo.postRepo.findOne({ where: { id: id } });
    return updatedPost;
  }
}
