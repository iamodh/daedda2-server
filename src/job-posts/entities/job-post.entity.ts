import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class JobPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
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

  @Column()
  createdAt: Date;

  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @Column()
  place: string;

  @Column()
  totalHours: number;
}
