import repo from "../config/repo";
import { Post } from "../entities/post.entity";
import { CustomError } from "../helpers/customError";
import { PostOptions } from "../types/post.options";
import { PostDto } from "../dtos/post/post.dto";
import { plainToInstance } from "class-transformer";

export class PostService {
  static async createPost(data: any) {
    // Fetch the complete user object if only ID is provided
    if (data.user && "id" in data.user && !("firstName" in data.user)) {
      const user = await repo.userRepo.findOne({ where: { id: data.user.id } });
      if (!user) {
        throw new CustomError("User not found", 404);
      }
      data.user = user;
    }

    const post = repo.postRepo.create(data);

    await repo.postRepo.save(post);
    return post;
  }

  static async getUsersSpecificPost(id: string, options: PostOptions) {
    const {
      sortBy = "createdAt",
      sortOrder = "DESC",
      search,
      userId,
    } = this.validateOptions(options);

    const query = this.buildPostQuery(search, sortBy, sortOrder, userId, id);
    const post = await query.getOne();

    if (!post) {
      throw new CustomError("Post not found", 404);
    }
    const postWithComments = await this.postWithComments([post]);
    const postDto = plainToInstance(PostDto, postWithComments[0], {
      excludeExtraneousValues: true,
    });

    return postDto;
  }

  static async editPost(id: string, data: Partial<Post>, ownerId: string) {
    const post = await repo.postRepo
      .createQueryBuilder("post")
      .leftJoin("post.user", "user")
      .select([
        "post.id",
        "post.title",
        "post.content",
        "post.filenames",
        "post.createdAt",
        "post.updatedAt",
        "user.id",
      ])
      .where("post.id = :id", { id })
      .getOne();

    if (!post) {
      throw new CustomError("Post not found", 404);
    }
    if (post.user.id !== ownerId) {
      throw new CustomError("You are not authorized to edit this post", 403);
    }

    await repo.postRepo.update(id, data);
    const updatedPost = await repo.postRepo.findOne({ where: { id: id } });
    const postDto = plainToInstance(PostDto, updatedPost, {
      excludeExtraneousValues: true,
    });
    return postDto;
  }
  static async getAllPosts(options: PostOptions) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
      search,
      userId,
    } = this.validateOptions(options);

    const query = this.buildPostQuery(search, sortBy, sortOrder, userId);
    // Get total count for pagination
    const totalItems = await query.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    const post = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const postsWithComments = await this.postWithComments(post);

    const postRes = plainToInstance(PostDto, postsWithComments, {
      excludeExtraneousValues: true,
    });

    return {
      posts: postRes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  private static buildPostQuery(
    search?: string,
    sortBy?: string,
    sortOrder?: "ASC" | "DESC",
    userId?: string,
    post_id?: string
  ) {
    let query = repo.postRepo
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .select([
        "post.id",
        "post.title",
        "post.content",
        "post.filenames",
        "post.createdAt",
        "post.updatedAt",
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.email",
        "user.profilePicture",
      ]);
    if (post_id) {
      query = query.andWhere("post.id = :post_id", { post_id });
    }
    if (search) {
      query = query.where(
        "(post.content ILIKE :search OR post.title ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.username ILIKE :search OR user.id = :userId)",
        { search: `%${search}%`, userId: userId || null }
      );
    }

    if (sortBy) {
      query = query.orderBy(`post.${sortBy}`, sortOrder || "DESC");
    }

    return query;
  }
  private static validateOptions(options: PostOptions) {
    const { page, limit, sortBy, sortOrder, search, userId } = options;
    if (options.limit && (options.limit < 1 || options.limit > 100)) {
      throw new CustomError("Limit must be between 1 and 100", 400);
    }
    if (page && page < 1) {
      throw new CustomError("Page must be greater than 0", 400);
    }
    if (sortBy && !["createdAt", "updatedAt", "title"].includes(sortBy)) {
      throw new CustomError("Invalid sortBy value", 400);
    }
    if (sortOrder && !["ASC", "DESC"].includes(sortOrder)) {
      throw new CustomError("Invalid sortOrder value", 400);
    }
    if (search && typeof search !== "string") {
      throw new CustomError("Search must be a string", 400);
    }
    if (userId && typeof userId !== "string") {
      throw new CustomError("User ID must be a string", 400);
    }
    return {
      page: page || 1,
      limit: limit || 10,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "DESC",
      search: search || "",
      userId: userId || "",
    };
  }
  private static async postWithComments(posts: Post[]) {
    if (!posts.length) return [];

    const postIds = posts.map((post) => post.id);

    // Optimized single query to get all comments with their users
    const commentsWithUsers = await repo.comRepo
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.user", "user")
      .select([
        "comment.id",
        "comment.content",
        "comment.createdAt",
        "comment.postId",
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.profilePicture",
      ])
      .where("comment.postId IN (:...postIds)", { postIds })
      .orderBy("comment.createdAt", "DESC")
      .getMany();

    // Group comments by post and get counts
    const commentsByPost = new Map<string, any[]>();
    const commentCounts = new Map<string, number>();

    commentsWithUsers.forEach((comment) => {
      const postId = (comment as any).postId;
      if (!commentsByPost.has(postId)) {
        commentsByPost.set(postId, []);
        commentCounts.set(postId, 0);
      }

      // Only add first 3 comments per post
      if (commentsByPost.get(postId)!.length < 3) {
        commentsByPost.get(postId)!.push({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          commenter: {
            id: comment.user.id,
            firstName: comment.user.firstName,
            lastName: comment.user.lastName,
            profilePicture: comment.user.profilePicture,
            fullName: `${comment.user.firstName} ${comment.user.lastName}`,
          },
        });
      }

      // Increment count
      commentCounts.set(postId, commentCounts.get(postId)! + 1);
    });

    // Transform data
    return posts.map((post: Post) => {
      const commentCount = commentCounts.get(post.id) || 0;
      const postComments = commentsByPost.get(post.id) || [];

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        images: post.filenames || [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: {
          id: post.user.id,
          firstName: post.user.firstName,
          lastName: post.user.lastName,
          profilePicture: post.user.profilePicture,
          fullName: `${post.user.firstName} ${post.user.lastName}`,
        },
        stats: {
          commentCount: commentCount,
          hasComments: commentCount > 0,
        },
        latestComments: postComments,
      };
    });
  }
}
