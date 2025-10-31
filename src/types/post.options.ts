export interface PostOptions {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "ASC" | "DESC";
  search?: string;
  userId?: string;
}
