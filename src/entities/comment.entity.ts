import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { Post } from "./post.entity";
import { User } from "./user.entity";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
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
