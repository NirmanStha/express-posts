import { Expose, Type } from "class-transformer";
import { UserDto } from "../user/user.dto";

export class AuthLoginDto {
  @Expose()
  status!: string;

  @Expose()
  message!: string;

  @Expose()
  @Type(() => UserDto)
  data!: UserDto;

  @Expose()
  accessToken!: string;

  @Expose()
  refreshToken!: string;
}
