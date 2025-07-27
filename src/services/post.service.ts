import repo from "../config/repo";
import { Post } from "../entities/post.entity";
import { AppDataSource } from "../config/dataSource";
import { CustomError } from "../helpers/customError";

export class PostService {
  static async createPost(data: Partial<Post>) {
    const post = repo.postRepo.create(data);

    await repo.postRepo.save(post);
    return post;
  }

  static async getUsersSpecificPost(id: string) {
    const post = await repo.postRepo
      .createQueryBuilder("post")
      .where("post.id = :id", { id })
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.comments", "comment")
      .leftJoinAndSelect("comment.user", "commentUser")
      .select([
        // Post details
        "post.id",
        "post.title",
        "post.content",
        "post.filenames",
        "post.createdAt",
        "post.updatedAt",

        // User details (exclude sensitive info)
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.username",
        "user.profilePicture",

        // Comment details
        "comment.id",
        "comment.content",
        "comment.createdAt",
        "comment.updatedAt",

        // Comment user details
        "commentUser.id",
        "commentUser.firstName",
        "commentUser.lastName",
        "commentUser.username",
        "commentUser.profilePicture",
      ])
      .orderBy("comment.createdAt", "DESC")
      .getOne();

    if (!post) {
      throw new CustomError("Post not found", 404);
    }

    // Transform response for better structure
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      images: post.filenames || [],
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: {
        id: post.user.id,
        firstName: post.user.firstName,
        lastName: post.user.lastName,
        username: post.user.username,
        profilePicture: post.user.profilePicture,
        fullName: `${post.user.firstName} ${post.user.lastName}`,
      },
      comments:
        post.comments?.map((comment) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          user: {
            id: comment.user.id,
            firstName: comment.user.firstName,
            lastName: comment.user.lastName,
            username: comment.user.username,
            profilePicture: comment.user.profilePicture,
            fullName: `${comment.user.firstName} ${comment.user.lastName}`,
          },
        })) || [],
      stats: {
        commentCount: post.comments?.length || 0,
        hasComments: (post.comments?.length || 0) > 0,
      },
    };
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
  static async getAllPosts(options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    search?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
      search,
    } = options || {};

    let query = repo.postRepo
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("post.comments", "comment")
      .leftJoinAndSelect("comment.user", "commentUser")
      .select([
        // Post details
        "post.id",
        "post.title",
        "post.content",
        "post.filenames",
        "post.createdAt",
        "post.updatedAt",

        // User details (excluding sensitive info)
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.email",
        "user.profilePicture",

        // Comment details
        "comment.id",
        "comment.content",
        "comment.createdAt",
        "comment.updatedAt",

        // Comment user details
        "commentUser.id",
        "commentUser.firstName",
        "commentUser.lastName",
        "commentUser.profilePicture",
      ]);

    // Add search functionality
    if (search) {
      query = query.where(
        "post.content ILIKE :search OR post.title ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search",
        { search: `%${search}%` }
      );
    }

    // Add sorting
    query = query.orderBy(`post.${sortBy}`, sortOrder);

    // Get total count for pagination
    const totalItems = await query.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    // Apply pagination
    const posts = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Transform the data to include comment counts and latest activity
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      images: post.filenames || [],
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: {
        id: post.user.id,
        firstName: post.user.firstName,
        lastName: post.user.lastName,
        email: post.user.email,
        profilePicture: post.user.profilePicture,
      },
      stats: {
        commentCount: post.comments?.length || 0,
        hasComments: (post.comments?.length || 0) > 0,
      },
      latestComments:
        post.comments
          ?.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          ?.slice(0, 3) // Only show latest 3 comments
          ?.map((comment) => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            user: {
              id: comment.user.id,
              firstName: comment.user.firstName,
              lastName: comment.user.lastName,
              profilePicture: comment.user.profilePicture,
              fullName: `${comment.user.firstName} ${comment.user.lastName}`,
            },
          })) || [],
    }));

    return {
      posts: transformedPosts,
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
