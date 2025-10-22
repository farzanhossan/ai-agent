import { FindOptionsSelect } from 'typeorm';

export interface IFindByIdBaseOptions {
  relations?: string[];
}

export interface IFindAllBaseOptions<T> {
  relations?: string[];
  select?: FindOptionsSelect<T>;
  // withoutPaginate?: boolean;
}
