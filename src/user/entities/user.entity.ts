import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Todo } from '../../todo/entities/todo.entity';

/**
 * User Entity
 * Represents a user in the system
 */
@Entity('users')
@Index(['email'], { unique: true })
export class User {
  /**
   * Unique identifier (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * User's email (unique, required)
   */
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  email!: string;

  /**
   * User's username (required)
   */
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  username!: string;

  /**
   * Hashed password (excluded from responses)
   */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  @Exclude()
  password!: string;

  /**
   * User's todos (one-to-many relationship)
   */
  @OneToMany(() => Todo, (todo) => todo.user)
  todos!: Todo[];

  /**
   * Account creation timestamp
   */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * Last update timestamp
   */
  @UpdateDateColumn()
  updatedAt!: Date;
}
