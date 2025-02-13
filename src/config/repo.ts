import { AppDataSource } from "./dataSource";

import { User } from "../entities/user.entity";
import { Post } from "../entities/post.entity";
const repo = {
  userRepo: AppDataSource.getRepository(User),
  postRepo: AppDataSource.getRepository(Post),
};
export default repo;
