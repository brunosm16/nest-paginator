import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserEntity {
  @Column()
  address: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  email: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  state: string;

  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  zip_code: string;
}
