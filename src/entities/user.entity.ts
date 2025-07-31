import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from "typeorm";
import { Post } from "./post.entity";
import { Comment } from "./comment.entity";
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  age!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column({
    type: "enum",
    enum: ["admin", "user"],
    default: "user",
  })
  role!: string;

  @Column()
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
