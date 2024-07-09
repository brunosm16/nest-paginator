import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class MockEntity {
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  description: string;

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;
}
