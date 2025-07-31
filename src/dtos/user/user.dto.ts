import { Expose } from "class-transformer";

export class UserDto {
  @Expose()
  id!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  age!: string;

  @Expose()
  email!: string;

  @Expose()
  username!: string;

  @Expose()
  role!: string;

  @Expose()
  profilePicture!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}

export class ShortUserDto {
  @Expose()
  id!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  fullName!: string;

  @Expose()
  username!: string;

  @Expose()
  profilePicture!: string;
}
