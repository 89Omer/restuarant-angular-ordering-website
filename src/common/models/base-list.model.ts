export type BaseListResponse ={
  meta: { current_page: number; from: number; last_page: number; path: string; per_page: number; to: number; total: number; };
  links: { first: string; last: string; prev: string; next: string };
  data: Array<any>;
}
