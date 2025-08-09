import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class JobPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 40 })
  title: string;

  @Column()
  location: string;

  @Column()
  pay: number;

  @Column()
  date: Date;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'text', nullable: true, default: null })
  imageUrl: string | null;

  @Column({ length: 40 })
  place: string;

  @Column()
  totalHours: number;

  @Column({ type: 'text' })
  content: string;

  @Column()
  hourlyWage: number;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;
}
