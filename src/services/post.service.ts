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

  static async getUsersSpecificPost(id: string) {
    const uid = parseInt(id);
    const post = await AppDataSource.getRepository(Post)
      .createQueryBuilder("post")
      .where("post.id = :id", { id: uid }) // Changed `like` to `=`, as IDs should match exactly
      .leftJoinAndSelect("post.user", "user") // Fetch user details
      .leftJoinAndSelect("post.comments", "comment") // Fetch comments
      .leftJoinAndSelect("comment.user", "commentUser") // Fetch comment author details
      .select([
        // Post details
        "post.id",
        "post.title",
        "post.content",
        "post.filenames",
        "post.createdAt",
        "post.updatedAt",

        // User details
        "user.id",
        "user.email",
        "user.firstName",
        "user.lastName",

        // Comment details
        "comment.id",
        "comment.content",
        "comment.createdAt",
        "comment.updatedAt",

        // Comment user details
        "commentUser.id",
        "commentUser.firstName",
        "commentUser.lastName",
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
  static async getAllPosts() {
    const posts = await repo.postRepo
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.comments", "comment")
      .select([
        "post",
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.age",
        "user.gender",
        "comment.id",
        "comment.content", // include any other comment fields you need
      ])
      .getMany();

    console.log(posts);

    return posts;
  }
}
