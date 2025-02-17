import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./user.entity";
import { Comment } from "./comment.entity";
@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  title!: string;

  @Column()
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
