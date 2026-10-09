export interface Book {
  book_id: string | number;
  isbn?: string;
  title: string;
  author?: string;
  publisher?: string;
  published_date?: string;
  category_id?: string;
  category_name?: string;
  description?: string;
  cover_url?: string;
  total_copies?: number | string;
  available_copies?: number | string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string | { code?: string; message?: string };
  status?: string;
  message?: string;
}
