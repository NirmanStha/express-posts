import { AppDataSource } from "./dataSource";

import { User } from "../entities/user.entity";
import { Post } from "../entities/post.entity";
import { Comment } from "../entities/comment.entity";
const repo = {
  userRepo: AppDataSource.getRepository(User),
  postRepo: AppDataSource.getRepository(Post),
  comRepo: AppDataSource.getRepository(Comment),
};
export default repo;
