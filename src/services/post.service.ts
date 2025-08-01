import repo from "../config/repo";
import { Post } from "../entities/post.entity";
import { AppDataSource } from "../config/dataSource";
import { CustomError } from "../helpers/customError";
import { PostOptions } from "../types/post.options";
import { PostDto } from "../dtos/post/post.dto";
import { PaginationDto } from "../dtos/pagination/pagination.dto";
import { plainToInstance } from "class-transformer";

export class PostService {
  static async createPost(data: Partial<Post>) {
    const post = repo.postRepo.create(data);

    await repo.postRepo.save(post);
    return post;
  }

  static async getUsersSpecificPost(id: string, options?: PostOptions) {
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
        "user.firstName",
        "user.lastName",
        "user.profilePicture",
      ])
      .where("post.id = :id", { id })
      .getOne();
    console.log("Post found:", post);
    const comments = await repo.comRepo
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.user", "user")
      .where("comment.postId = :postId", { postId: id })
      .orderBy("comment.createdAt", "DESC")
      .limit(5)
      .getMany();

    if (!post) {
      throw new CustomError("Post not found", 404);
    }
    const result = {
      ...post,
      author: post.user,
      latestComments: comments,
      stats: {
        commentCount: comments.length,
        hasComments: comments.length > 0,
      },
    };

    const postDto = plainToInstance(PostDto, result, {
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
    userId?: string
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

    // Get comment counts efficiently
    const commentCounts = await repo.postRepo
      .createQueryBuilder("post")
      .leftJoin("post.comments", "comment")
      .select("post.id", "postId")
      .addSelect("COUNT(comment.id)", "commentCount")
      .where("post.id IN (:...postIds)", { postIds })
      .groupBy("post.id")
      .getRawMany();

    // Get latest 3 comments for each post efficiently
    const latestComments = await repo.postRepo.manager
      .createQueryBuilder()
      .select("ranked_comments.c_id", "id")
      .addSelect("ranked_comments.c_content", "content")
      .addSelect("ranked_comments.c_createdAt", "createdAt")
      .addSelect("ranked_comments.c_postId", "postId")
      .addSelect("u.id", "userId")
      .addSelect("u.firstName", "userFirstName")
      .addSelect("u.lastName", "userLastName")
      .addSelect("u.profilePicture", "userProfilePicture")
      .from((subQuery) => {
        return subQuery
          .select([
            "c.id AS c_id",
            "c.content AS c_content",
            "c.createdAt AS c_createdAt",
            "c.userId AS c_userId",
            "c.postId AS c_postId",
            "ROW_NUMBER() OVER (PARTITION BY c.postId ORDER BY c.createdAt DESC) AS rn",
          ])
          .from("comment", "c")
          .where("c.postId IN (:...postIds)", { postIds });
      }, "ranked_comments")
      .leftJoin("user", "u", "ranked_comments.c_userId = u.id")
      .where("ranked_comments.rn <= 3")
      .getRawMany();

    // Transform data
    return posts.map((post: Post) => {
      const commentCount =
        commentCounts.find((cc) => cc.postId === post.id)?.commentCount || 0;
      const postComments = latestComments
        .filter((comment) => comment.postId === post.id)
        .map((comment) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          commenter: {
            id: comment.userId,
            firstName: comment.userFirstName,
            lastName: comment.userLastName,
            profilePicture: comment.userProfilePicture,
            fullName: `${comment.userFirstName} ${comment.userLastName}`,
          },
        }));

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
          commentCount: parseInt(commentCount),
          hasComments: parseInt(commentCount) > 0,
        },
        latestComments: postComments,
      };
    });
  }
}
