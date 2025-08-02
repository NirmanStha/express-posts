import { Expose, Type } from "class-transformer";
import { ShortUserDto } from "../user/user.dto";
import { Post } from "../../entities/post.entity";
import { PostDto } from "../post/post.dto";

export class CommentDto {
  @Expose()
  id!: number;

  @Expose()
  postId!: number;

  @Expose()
  content!: string;

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;

  @Expose()
  @Type(() => ShortUserDto)
  commenter!: ShortUserDto;
}

export class CreateCommentDto {
  @Expose()
  id!: number;

  @Expose()
  content!: string;

  @Expose()
  postId!: number;

  @Expose()
  @Type(() => ShortUserDto)
  author!: ShortUserDto;

  @Expose()
  @Type(() => PostDto)
  post!: PostDto;
}
