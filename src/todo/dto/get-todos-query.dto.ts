import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for Todo list query parameters
 * Includes pagination, search, filtering, and sorting
 */
export class GetTodosQueryDto {
  /**
   * Page number (1-indexed)
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /**
   * Number of items per page
   * @example 10
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  /**
   * Search term (searches in title and description)
   * @example "grocery"
   */
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Filter by completion status
   * @example "completed"
   */
  @IsOptional()
  @IsIn(['all', 'completed', 'pending'])
  status?: 'all' | 'completed' | 'pending' = 'all';

  /**
   * Sort field
   * @example "createdAt"
   */
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'title', 'completed'])
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'completed' = 'createdAt';

  /**
   * Sort order
   * @example "DESC"
   */
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
