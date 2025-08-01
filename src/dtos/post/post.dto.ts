import { Expose, Type } from "class-transformer";
import { ShortUserDto } from "../user/user.dto";
import { CommentDto } from "../comment/comment.dto";
export class StatsDto {
  @Expose()
  commentCount!: number;

  @Expose()
  hasComments!: boolean;
}

export class PostDto {
  @Expose()
  id!: number;

  @Expose()
  title!: string;

  @Expose()
  content!: string;

  @Expose()
  filenames!: string[];

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;

  @Expose({ name: "author" })
  @Type(() => ShortUserDto)
  author!: ShortUserDto;

  @Expose()
  @Type(() => CommentDto)
  latestComments!: CommentDto[];

  @Expose()
  @Type(() => StatsDto)
  stats!: StatsDto;
}
