import { Expose, Type } from "class-transformer";
import { ShortUserDto } from "../user/user.dto";

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
