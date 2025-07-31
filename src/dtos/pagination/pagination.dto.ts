import { Expose } from "class-transformer";

export class PaginationDto<T> {
  @Expose()
  totalItems!: number;

  @Expose()
  totalPages!: number;

  @Expose()
  currentPage!: number;

  @Expose()
  hasNextPage!: boolean;

  @Expose()
  hasPreviousPage!: boolean;

  @Expose()
  limit!: number;
}
