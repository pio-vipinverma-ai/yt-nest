import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

/**
 * Todo Entity
 * Represents a todo item in the database
 */
@Entity('todos')
@Index(['completed']) // Index for filtering by completion status
@Index(['createdAt']) // Index for sorting by creation date
@Index(['userId']) // Index for filtering by user
export class Todo {
  /**
   * Unique identifier (UUID)
   * Auto-generated using PostgreSQL's uuid_generate_v4()
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Todo title (required)
   * Maximum length: 100 characters
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  title!: string;

  /**
   * Todo description (optional)
   * Maximum length: 500 characters
   */
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  description?: string;

  /**
   * Attached file name (optional)
   */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  attachmentName?: string;

  /**
   * Attached file MIME type (optional)
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  attachmentMimeType?: string;

  /**
   * Attached file size in bytes (optional)
   */
  @Column({
    type: 'bigint',
    nullable: true,
  })
  attachmentSize?: number;

  /**
   * Attached file path on the server (optional)
   */
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  attachmentPath?: string;

  /**
   * Completion status
   * Defaults to false (not completed)
   */
  @Column({
    type: 'boolean',
    default: false,
    nullable: false,
  })
  completed!: boolean;

  /**
   * User ID (foreign key to users table)
   * References the user who owns this todo
   */
  @Column({
    type: 'uuid',
    nullable: false,
  })
  userId!: string;

  /**
   * User relationship (many-to-one)
   * Each todo belongs to one user
   */
  @ManyToOne(() => User, (user) => user.todos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  /**
   * Creation timestamp
   * Automatically set when the record is created
   */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  /**
   * Last update timestamp
   * Automatically updated when the record is modified
   */
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
