import {
  Directive,
  forwardRef,
  HostListener,
  inject,
  Injectable,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ControlContainer } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  debounceTime,
  defer,
  EMPTY,
  filter,
  first,
  fromEvent,
  map,
  merge,
  NEVER,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { rawValueChanges } from './raw-value-changes';

@Injectable({
  providedIn: 'root',
  useExisting: forwardRef(() => FrFormCacheSessionStorageService),
})
export abstract class FrFormCacheStorageService {
  abstract getValue<T>(cacheKey: string): Observable<T | null>;
  abstract setValue<T>(cacheKey: string, value: T): Observable<void>;
  abstract removeValue(cacheKey: string): Observable<void>;
}

@Injectable({
  providedIn: 'root',
})
export class FrFormCacheSessionStorageService
  implements FrFormCacheStorageService
{
  readonly #cachePrefix = 'FrFormCacheSessionStorageService.';

  getValue<T>(cacheKey: string): Observable<T | null> {
    return defer(() => {
      const json = sessionStorage.getItem(this.#cachePrefix + cacheKey);
      if (json == null) {
        return of(null);
      }

      const value = JSON.parse(json);
      return of(value);
    }).pipe(catchError((_err) => of(null)));
  }

  setValue<T>(cacheKey: string, value: T): Observable<void> {
    return defer(() => {
      const json = JSON.stringify(value);
      sessionStorage.setItem(this.#cachePrefix + cacheKey, json);
      return of();
    }).pipe(catchError((_err) => of()));
  }

  removeValue(cacheKey: string): Observable<void> {
    return defer(() => {
      sessionStorage.removeItem(this.#cachePrefix + cacheKey);
      return of();
    }).pipe(catchError((_err) => of()));
  }
}

@Directive({
  selector: 'form[formGroup][frFormCacheKey]',
  standalone: true,
})
export class FrFormCacheDirective<T> implements OnInit, OnDestroy {
  readonly #destroyed = new Subject<void>();
  readonly #container = inject(ControlContainer, { self: true });
  readonly #storageService = inject(FrFormCacheStorageService);

  readonly #cacheKey = new BehaviorSubject<string>('');
  @Input() set frFormCacheKey(cacheKey: string) {
    this.#cacheKey.next(cacheKey);
  }

  @Output() cachedValue: Observable<T> = this.#cacheKey.pipe(
    switchMap((cacheKey) =>
      cacheKey === '' ? of(null) : this.#storageService.getValue<T>(cacheKey)
    ),
    filter((value) => value != null),
    map((value) => value as T),
    takeUntil(this.#destroyed)
  );

  @HostListener('submit')
  onSubmit(): void {
    this.removeValue();
  }

  @HostListener('reset')
  onReset(): void {
    this.removeValue();
  }

  ngOnInit(): void {
    this.#cacheKey
      .pipe(
        switchMap((cacheKey) => {
          const value$ =
            cacheKey === '' || this.#container.control == null
              ? NEVER
              : rawValueChanges(this.#container.control).pipe(
                  debounceTime(500)
                );
          return combineLatest({ cacheKey: of(cacheKey), value: value$ });
        }),
        takeUntil(this.#destroyed),
        switchMap(({ cacheKey, value }) =>
          this.#storageService.setValue(cacheKey, value)
        )
      )
      .subscribe();

    merge(fromEvent(window, 'beforeunload'), this.#destroyed)
      .pipe(
        switchMap(() => this.#cacheKey),
        switchMap((cacheKey) => {
          if (cacheKey === '' || this.#container.control == null) {
            return EMPTY;
          }

          const value = this.#container.control.getRawValue();
          return this.#storageService.setValue(cacheKey, value);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.#destroyed.next();
    this.#destroyed.complete();
  }

  removeValue(): void {
    this.#cacheKey
      .pipe(
        first(),
        concatMap((cacheKey) =>
          cacheKey === '' ? of() : this.#storageService.removeValue(cacheKey)
        )
      )
      .subscribe();
  }
}
