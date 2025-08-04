import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  name: string;

  @Column({ length: 20 })
  nickname: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 40 })
  email: string;

  @Column()
  password: string;

  @Column()
  isSocial: boolean;

  @Column()
  imageUrl: string;

  @Column()
  createdAt: Date;
}
