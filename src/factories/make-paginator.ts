import { Paginator } from '../classes/paginator';

function paginator<T>(): Paginator<T> {
  return new Paginator<T>();
}

export default paginator;
