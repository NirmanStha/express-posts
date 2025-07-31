import { Expose, Type } from "class-transformer";
import { ShortUserDto } from "../user/user.dto";

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

  @Expose()
  @Type(() => ShortUserDto)
  user!: ShortUserDto;
}
