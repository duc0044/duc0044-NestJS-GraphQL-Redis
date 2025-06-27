import { PaginationInput, PaginationMeta } from '../dto/pagination.dto';

export interface PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function calculatePaginationMeta(
  totalItems: number,
  currentPage: number,
  itemsPerPage: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

export function getPaginationParams(paginationInput: PaginationInput) {
  const { page = 1, limit = 10 } = paginationInput;
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    page,
    limit,
  };
}
