import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO for updating an existing todo
 * All fields are optional
 */
export class UpdateTodoDto {
  /**
   * Updated title of the todo
   * @example "Buy groceries and cook dinner"
   */
  @IsString({ message: 'Title must be a string' })
  @IsOptional()
  @MinLength(1, { message: 'Title must be at least 1 character' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title?: string;

  /**
   * Updated description of the todo
   * @example "Updated shopping list with dinner ingredients"
   */
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  /**
   * Completion status of the todo
   * @example true
   */
  @IsBoolean({ message: 'Completed must be a boolean value' })
  @IsOptional()
  completed?: boolean;
}
