import {
  Column,
  CreateDateColumn,
  Entity,
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

  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ length: 40 })
  place: string;

  @Column()
  totalHours: number;

  @Column({ type: 'text' })
  content: string;
}
