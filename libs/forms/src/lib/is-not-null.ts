import { filter, Observable, OperatorFunction } from 'rxjs';

const isNotNullGuard = <T>(r: T | null | undefined): r is T => {
  return r != null;
};

/**
 * Typesafe filter operator which filter `null` and `undefined`.
 */
export const isNotNull = <T>(): OperatorFunction<T | null | undefined, T> => {
  return (source: Observable<T | null | undefined>): Observable<T> => {
    return source.pipe(filter(isNotNullGuard));
  };
};
