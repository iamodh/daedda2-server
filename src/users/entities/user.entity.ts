import { IsOptional, Length } from 'class-validator';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Length(8, 20)
  @Column({ length: 20, unique: true })
  username: string;

  @Length(1, 20)
  @Column({ length: 20 })
  nickname: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 40 })
  email: string;

  @Column()
  password: string;

  @IsOptional()
  @Column({ type: 'text', nullable: true, default: null })
  imageUrl?: string | null;

  @CreateDateColumn()
  createdAt: Date;
  jobPosts: any;

  @BeforeInsert()
  private beforeInsert() {
    this.password = bcrypt.hashSync(this.password, 10);
  }
}
