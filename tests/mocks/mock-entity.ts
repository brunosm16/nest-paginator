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

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}
