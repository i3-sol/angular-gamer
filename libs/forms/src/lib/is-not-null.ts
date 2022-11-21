import { filter, Observable, OperatorFunction } from 'rxjs';

const isNotNullGuard = <T>(r: T): r is NonNullable<T> => {
  return r !== null && r !== undefined;
};

/**
 * Typesafe filter operator which filter `null` and `undefined`.
 */
export const isNotNull = <T>(): OperatorFunction<T, NonNullable<T>> => {
  return (source: Observable<T>): Observable<NonNullable<T>> => {
    return source.pipe(filter(isNotNullGuard));
  };
};
