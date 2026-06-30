import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO for creating a new todo
 */
export class CreateTodoDto {
  /**
   * The title of the todo
   * @example "Buy groceries"
   */
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(1, { message: 'Title must be at least 1 character' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title!: string;

  /**
   * Optional description of the todo
   * @example "Milk, bread, and eggs from the store"
   */
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}
