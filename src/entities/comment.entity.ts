import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
} from "typeorm";
import { Post } from "./post.entity";
import { User } from "./user.entity";

@Entity()
@Index(["post"]) // Index for finding comments by post
@Index(["user"]) // Index for finding comments by user
@Index(["createdAt"]) // Index for sorting comments
export class Comment {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({ type: "text" })
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: "CASCADE" })
  post!: Post;
}
