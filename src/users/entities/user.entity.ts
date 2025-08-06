import { Max, Min } from 'class-validator';
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

  @Min(8)
  @Max(20)
  @Column({ length: 20, unique: true })
  username: string;

  @Max(20)
  @Column({ length: 20 })
  nickname: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 40 })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'text', nullable: true, default: null })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  private beforeInsert() {
    this.password = bcrypt.hashSync(this.password, 10);
  }
}
