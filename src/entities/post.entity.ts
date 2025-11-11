import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from "typeorm";
import { User } from "./user.entity";
import { Comment } from "./comment.entity";
@Entity()
@Index(["createdAt"]) // Index for sorting by creation date
@Index(["updatedAt"]) // Index for sorting by update date
@Index(["user"]) // Index for user's posts queries
export class Post {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "simple-array" })
  filenames!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];

  @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE" })
  user!: User;
}
