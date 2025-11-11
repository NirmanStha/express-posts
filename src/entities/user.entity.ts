import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Post } from "./post.entity";
import { Comment } from "./comment.entity";
@Entity()
@Index(["email"]) // Index for login queries
@Index(["username"]) // Index for username lookups
export class User {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({ length: 100 })
  firstName!: string;

  @Column({ length: 100 })
  lastName!: string;

  @Column({ type: "int" })
  age!: number;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ unique: true, length: 50 })
  username!: string;

  @Column({ length: 255 })
  password!: string;

  @Column({
    type: "enum",
    enum: ["admin", "user"],
    default: "user",
  })
  role!: string;

  @Column({ length: 255, nullable: true })
  profilePicture!: string;

  @Column({
    type: "enum",
    enum: ["male", "female", "others"],
  })
  gender!: string;
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Post, (post) => post.user, { cascade: true })
  posts!: Post[];

  @OneToMany(() => Comment, (comment) => comment.user, { cascade: true })
  comments!: Comment[];
}
